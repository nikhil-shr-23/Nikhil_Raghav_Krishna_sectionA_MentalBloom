from typing import List, Dict, Any, Optional
from loguru import logger
import time
import asyncio
import json
import uuid

from app.llm import initialize_gemini_llm, generate_response
from app.vectorstore import retrieve_relevant_documents
from app.ml_services import analyze_text
from app.models import Message, Source, SentimentInfo, IntentInfo, ChatResponse
from app.config import settings

async def process_chat_request(
    messages: List[Message],
    user_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
    include_sources: bool = True,
    max_tokens: Optional[int] = None,
    temperature: Optional[float] = None
) -> ChatResponse:
    """Process a chat request through the RAG pipeline"""
    start_time = time.time()

    try:

        if not conversation_id:
            conversation_id = str(uuid.uuid4())

        # Get the user's latest message
        user_message = next((m for m in reversed(messages) if m.role == "user"), None)
        if not user_message:
            raise ValueError("No user message found in the conversation")

        # Get previous messages
        previous_messages = [m.content for m in messages if m.role == "user" or m.role == "assistant"]


        analysis_result = await analyze_text(
            user_message.content,
            user_id=user_id,
            conversation_id=conversation_id,
            previous_messages=previous_messages[:-1] if len(previous_messages) > 1 else None
        )

        sentiment_info = analysis_result.get("sentiment")
        intent_info = analysis_result.get("intent")


        journal_docs = []
        if user_id:
            journal_docs = retrieve_relevant_documents(
                query=user_message.content,
                k=settings.MAX_DOCUMENTS // 2,
                filter={"user_id": user_id, "type": "journal_entry"}
            )

            if journal_docs:
                logger.info(f"Found {len(journal_docs)} relevant journal entries")


        general_docs = retrieve_relevant_documents(
            query=user_message.content,
            k=settings.MAX_DOCUMENTS - len(journal_docs)  # Use remaining slots
        )


        relevant_docs = journal_docs + general_docs



        llm = initialize_gemini_llm()

        response_text, llm_time = generate_response(
            llm=llm,
            user_input=user_message.content,
            retrieved_documents=relevant_docs,
            chat_history=messages[:-1],
            sentiment_info=sentiment_info,
            intent_info=intent_info
        )


        sources = []
        if include_sources and relevant_docs:
            for doc in relevant_docs:
                sources.append(Source(
                    title=doc.get("title", "Untitled"),
                    url=doc.get("url"),
                    content_snippet=doc.get("content_snippet", ""),
                    relevance_score=doc.get("relevance_score", 0)
                ))

        # Calculate total processing time
        processing_time = (time.time() - start_time) * 1000  # in milliseconds


        response = ChatResponse(
            message=response_text,
            sources=sources,
            sentiment=sentiment_info.get('sentiment') if sentiment_info else None,
            intent=intent_info.get('intent') if intent_info else None,
            conversation_id=conversation_id
        )

        logger.info(f"Chat request processed in {processing_time:.2f}ms")
        return response

    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise
