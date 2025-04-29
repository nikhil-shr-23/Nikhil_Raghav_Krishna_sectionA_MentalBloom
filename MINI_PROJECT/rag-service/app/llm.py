import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import LLMChain
from typing import List, Dict, Any, Optional
from loguru import logger
import time

from app.config import settings
from app.models import Message, MessageRole

# Configure Google Generative AI
genai.configure(api_key=settings.GOOGLE_API_KEY)

def initialize_gemini_llm():
    """Initialize the Gemini LLM with the configured settings"""
    try:
        model_name = "models/gemini-1.5-flash-002"

        llm = ChatGoogleGenerativeAI(
            model=model_name,
            temperature=settings.GEMINI_TEMPERATURE,
            top_p=settings.GEMINI_TOP_P,
            top_k=settings.GEMINI_TOP_K,
            max_output_tokens=settings.GEMINI_MAX_OUTPUT_TOKENS,
            convert_system_message_to_human=True,
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            ]
        )
        logger.info(f"Gemini LLM initialized with model: {model_name}")
        return llm
    except Exception as e:
        logger.error(f"Error initializing Gemini LLM: {e}")
        raise

def convert_messages_to_langchain_format(messages: List[Message]):
    """Convert our message format to LangChain message format"""
    lc_messages = []

    for message in messages:
        if message.role == MessageRole.SYSTEM:
            lc_messages.append(SystemMessage(content=message.content))
        elif message.role == MessageRole.USER:
            lc_messages.append(HumanMessage(content=message.content))
        elif message.role == MessageRole.ASSISTANT:
            lc_messages.append(AIMessage(content=message.content))

    return lc_messages

def create_rag_prompt_template(sentiment_info: Optional[Dict] = None, intent_info: Optional[Dict] = None):
    """Create a prompt template for RAG that incorporates sentiment and intent information"""

    # Base system prompt
    system_prompt = """You are MentalBloom, an empathetic and supportive mental health assistant.
Your goal is to provide helpful, accurate, and compassionate responses to users seeking mental health support.

Guidelines:
- Be warm, empathetic, and supportive in your tone
- Provide evidence-based information when possible
- Never claim to diagnose conditions or replace professional help
- Encourage seeking professional help for serious concerns
- Respect user privacy and maintain confidentiality
- Be sensitive to cultural differences
- Focus on providing practical, actionable advice when appropriate
- Acknowledge the user's feelings and validate their experiences
"""

    if sentiment_info:
        sentiment = sentiment_info.get("sentiment", "neutral")
        emotions = sentiment_info.get("emotions", {})

        # Find the dominant emotion
        dominant_emotion = max(emotions.items(), key=lambda x: x[1])[0] if emotions else "neutral"

        sentiment_prompt = f"""
The user's message shows a {sentiment} sentiment with primarily {dominant_emotion} emotions.
Adjust your response to be appropriately sensitive to their emotional state.
"""
        system_prompt += sentiment_prompt

    # Add intent awareness if available
    if intent_info:
        intent = intent_info.get("primary_intent", "unknown")
        is_emergency = intent_info.get("is_emergency", False)
        response_type = intent_info.get("suggested_response_type", "general")

        intent_prompt = f"""
The user's intent appears to be: {intent}
"""

        if is_emergency:
            intent_prompt += """
THIS IS A POTENTIAL EMERGENCY SITUATION. Prioritize user safety:
- Express concern for their wellbeing
- Provide crisis resources (hotlines, text lines)
- Encourage immediate professional help
- Be direct but compassionate
"""

        if response_type:
            intent_prompt += f"""
Use a {response_type} response approach.
"""

        system_prompt += intent_prompt

    system_prompt += """
Use the following retrieved documents to inform your response.
Incorporate relevant information from these sources, but maintain a conversational tone.
If the documents don't contain relevant information, rely on your general knowledge but be honest about limitations.

Retrieved documents:
{{retrieved_documents}}

Remember to be empathetic, accurate, and supportive in your response.
"""

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])

    return prompt_template

def generate_response(
    llm,
    user_input: str,
    retrieved_documents: List[Dict],
    chat_history: List[Message] = None,
    sentiment_info: Optional[Dict] = None,
    intent_info: Optional[Dict] = None
):
    """Generate a response using the LLM with RAG"""
    start_time = time.time()

    try:
        docs_text = ""
        for i, doc in enumerate(retrieved_documents):
            docs_text += f"[{i+1}] {doc.get('title', 'Untitled')}\n"
            docs_text += f"Content: {doc.get('content', '')}\n\n"

        prompt = create_rag_prompt_template(sentiment_info, intent_info)


        lc_history = convert_messages_to_langchain_format(chat_history) if chat_history else []

        chain = LLMChain(llm=llm, prompt=prompt)

        # Generate response from here 
        response = chain.run(
            input=user_input,
            chat_history=lc_history,
            retrieved_documents=docs_text
        )

        processing_time = (time.time() - start_time) * 1000  # in milliseconds
        logger.info(f"Generated response in {processing_time:.2f}ms")

        return response, processing_time
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        raise
