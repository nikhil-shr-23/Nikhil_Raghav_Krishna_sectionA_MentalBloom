import re
import time
import nltk
import json
import redis
import os
import pytz
import spacy
import joblib
from loguru import logger
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from transformers import pipeline
from app.models import Entity


try:
    nltk.data.find('punkt')
    nltk.data.find('stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')


try:
    nlp = spacy.load("en_core_web_sm")
    spacy_available = True
except Exception as e:
    logger.error(f"Error loading spaCy model: {e}")
    spacy_available = False
    nlp = None


try:
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    redis_client.ping() 
    redis_available = True
    logger.info("Redis connection established")
except Exception as e:
    logger.warning(f"Redis not available: {e}")
    redis_available = False
    redis_client = None

# Hugging Face zero-shot classification model
try:
    zero_shot_classifier = pipeline(
        "zero-shot-classification",
        model="facebook/bart-large-mnli",
        device=-1  # Use CPU
    )
    zero_shot_available = True
except Exception as e:
    logger.error(f"Error loading zero-shot classifier: {e}")
    zero_shot_available = False
    zero_shot_classifier = None


INTENT_KEYWORDS = {
    "venting": [
        "frustrated", "angry", "upset", "annoyed", "irritated", "mad", "furious",
        "tired of", "sick of", "fed up", "had enough", "vent", "complain", "rant",
        "just saying", "need to get this off my chest", "bothering me"
    ],
    "seeking_advice": [
        "advice", "help", "suggestion", "recommend", "what should", "how can I",
        "what do you think", "what would you do", "how do I", "how to", "tips",
        "guidance", "insight", "opinion", "perspective", "should I"
    ],
    "emergency": [
        "suicide", "kill myself", "end my life", "don't want to live", "want to die",
        "harm myself", "hurt myself", "self-harm", "emergency", "crisis", "urgent",
        "immediate help", "desperate", "hopeless", "can't go on", "overdose"
    ],
    "gratitude": [
        "thank", "grateful", "appreciate", "thanks", "thankful", "blessing",
        "honored", "indebted", "recognition", "acknowledgment"
    ],
    "greeting": [
        "hello", "hi", "hey", "greetings", "good morning", "good afternoon",
        "good evening", "howdy", "what's up", "how are you", "nice to meet"
    ],
    "farewell": [
        "goodbye", "bye", "see you", "talk to you later", "until next time",
        "farewell", "take care", "have a good day", "have a nice day", "later"
    ],
    "general_question": [
        "what is", "who is", "where is", "when is", "why is", "how is",
        "can you explain", "tell me about", "information about", "learn about"
    ],
    "sharing_experience": [
        "happened to me", "my experience", "I experienced", "I went through",
        "I've been", "I have been", "in my case", "from my perspective"
    ],
    "seeking_clarification": [
        "what do you mean", "could you explain", "I don't understand",
        "clarify", "confused about", "not sure what", "what exactly"
    ],
    "expressing_opinion": [
        "I think", "I believe", "in my opinion", "I feel that", "from my point of view",
        "as I see it", "I would say", "I consider", "my take on"
    ]
}

# Define emergency phrases 
EMERGENCY_PHRASES = [
    "i want to kill myself",
    "i want to die",
    "i want to end my life",
    "i don't want to live anymore",
    "i'm going to kill myself",
    "i'm planning to commit suicide",
    "i'm thinking about suicide",
    "i'm going to harm myself",
    "i'm going to hurt myself",
    "i have a plan to kill myself",
    "i've written a suicide note",
    "i'm ready to end it all",
    "there's no reason to live",
    "everyone would be better off without me",
    "i can't take it anymore"
]

# Define response types 
RESPONSE_TYPES = {
    "venting": "empathetic_listening",
    "seeking_advice": "helpful_guidance",
    "emergency": "crisis_support",
    "gratitude": "acknowledgment",
    "greeting": "friendly_greeting",
    "farewell": "polite_goodbye",
    "general_question": "informative",
    "sharing_experience": "validation",
    "seeking_clarification": "explanation",
    "expressing_opinion": "respectful_engagement"
}


MODEL_PATH = "models/intent_classifier.joblib"
try:
    if os.path.exists(MODEL_PATH):
        intent_classifier = joblib.load(MODEL_PATH)
        ml_model_available = True
        logger.info("ML intent classifier loaded successfully")
    else:
  
        logger.info("Creating new ML intent classifier")

        texts = []
        labels = []
        for intent, keywords in INTENT_KEYWORDS.items():
            for keyword in keywords:
                texts.append(keyword)
                labels.append(intent)
        
        
        intent_classifier = Pipeline([
            ('tfidf', TfidfVectorizer(max_features=5000)),
            ('clf', MultinomialNB())
        ])
        intent_classifier.fit(texts, labels)
        
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(intent_classifier, MODEL_PATH)
        ml_model_available = True
except Exception as e:
    logger.error(f"Error loading/creating ML model: {e}")
    intent_classifier = None
    ml_model_available = False

def preprocess_text(text: str) -> List[str]:
    """Preprocess text by converting to lowercase, removing punctuation and stopwords"""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word not in stop_words]
    return filtered_tokens

def extract_entities(text: str) -> List[Entity]:
    """Extract entities from text using spaCy"""
    if not spacy_available or not nlp:
        return []
    
    try:
        doc = nlp(text)
        entities = []
        
        for ent in doc.ents:
            entities.append(Entity(
                text=ent.text,
                label=ent.label_,
                start=ent.start_char,
                end=ent.end_char,
                confidence=0.8 
            ))
        
        return entities
    except Exception as e:
        logger.error(f"Error extracting entities: {e}")
        return []

def detect_intent_with_ml(text: str) -> Tuple[str, float]:
    """Detect intent using the ML model"""
    if not ml_model_available or not intent_classifier:
        return "unknown", 0.0
    
    try:
    
        intent_proba = intent_classifier.predict_proba([text])[0]
        intent_names = intent_classifier.classes_
        
       
        max_idx = intent_proba.argmax()
        intent = intent_names[max_idx]
        confidence = intent_proba[max_idx]
        
        return intent, float(confidence)
    except Exception as e:
        logger.error(f"Error detecting intent with ML: {e}")
        return "unknown", 0.0

def detect_intent_with_zero_shot(text: str) -> Dict[str, float]:
    """Detect intent using zero-shot classification"""
    if not zero_shot_available or not zero_shot_classifier:
        return {}
    
    try:
 
        candidate_labels = list(INTENT_KEYWORDS.keys())
        

        result = zero_shot_classifier(text, candidate_labels)
        

        intent_scores = {}
        for label, score in zip(result['labels'], result['scores']):
            intent_scores[label] = score
            
        return intent_scores
    except Exception as e:
        logger.error(f"Error detecting intent with zero-shot: {e}")
        return {}

def detect_intent_with_keywords(text: str) -> Dict[str, float]:
    """Detect intent using keyword matching (fallback method)"""
    text_lower = text.lower()
    
    
    intent_scores = {}
    for intent, keywords in INTENT_KEYWORDS.items():
        
        matches = sum(1 for keyword in keywords if keyword.lower() in text_lower)
       
        if matches > 0:
            intent_scores[intent] = matches / len(keywords)
        else:
            intent_scores[intent] = 0
            
    return intent_scores

def check_emergency(text: str) -> bool:
    """Check if text contains emergency phrases"""
    text_lower = text.lower()
    
    for phrase in EMERGENCY_PHRASES:
        if phrase in text_lower:
            return True
            
    return False

def get_context_aware_intent(text: str, previous_messages: List[str] = None, 
                            user_id: str = None, conversation_id: str = None) -> Optional[str]:
    """Get context-aware intent by considering previous messages"""
    if not previous_messages and not redis_available:
        return None
        
    try:
        recent_messages = []
        

        if previous_messages:
            recent_messages = previous_messages
  
        elif redis_available and conversation_id:
            conversation_key = f"conversation:{conversation_id}:intents"
            recent_messages_data = redis_client.lrange(conversation_key, 0, 4)  # Get last 5 messages
            
            for msg_data in recent_messages_data:
                try:
                    msg = json.loads(msg_data)
                    recent_messages.append(msg.get("text", ""))
                except:
                    continue
        
        if not recent_messages:
            return None
            
       
        if recent_messages and recent_messages[-1].endswith("?"):
            return "answering_question"
            

        if len(recent_messages) >= 3:
            short_messages = sum(1 for msg in recent_messages if len(msg.split()) < 5)
            if short_messages >= 2:
                return "casual_conversation"
                
  
        previous_text = " ".join(recent_messages)
        if "help" in previous_text.lower() and "?" in previous_text:
            return "follow_up_to_question"
            
        return None
    except Exception as e:
        logger.error(f"Error getting context-aware intent: {e}")
        return None

def store_intent(text: str, intent_data: Dict, user_id: Optional[str] = None, 
                conversation_id: Optional[str] = None) -> None:
    """Store intent data in Redis for context analysis"""
    if not redis_available:
        return
        
    try:
        timestamp = datetime.now(pytz.UTC).isoformat()
        
      
        data_to_store = {
            "text": text,
            "primary_intent": intent_data.get("primary_intent", "unknown"),
            "confidence": intent_data.get("confidence", 0),
            "timestamp": timestamp
        }
        
       
        if conversation_id:
            conversation_key = f"conversation:{conversation_id}:intents"
            redis_client.lpush(conversation_key, json.dumps(data_to_store))
            redis_client.ltrim(conversation_key, 0, 19) 
            

        if user_id:
            user_key = f"user:{user_id}:intents"
            redis_client.lpush(user_key, json.dumps(data_to_store))
            redis_client.ltrim(user_key, 0, 49)
            
            # Set expiration for user data (30 days)
            redis_client.expire(user_key, 60 * 60 * 24 * 30)
    except Exception as e:
        logger.error(f"Error storing intent: {e}")
