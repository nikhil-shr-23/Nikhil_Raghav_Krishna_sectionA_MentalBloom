import httpx
import json
from typing import Dict, Any, Optional
from loguru import logger
import time
import asyncio

from app.config import settings

async def analyze_sentiment(text: str, user_id: Optional[str] = None, conversation_id: Optional[str] = None):
    """Call the sentiment analysis service to analyze text sentiment"""
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{settings.SENTIMENT_SERVICE_URL}/analyze-sentiment",
                json={
                    "text": text,
                    "user_id": user_id,
                    "conversation_id": conversation_id
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Error from sentiment service: {response.status_code} - {response.text}")
                return None
                
            result = response.json()
            processing_time = (time.time() - start_time) * 1000  # in milliseconds
            logger.info(f"Sentiment analysis completed in {processing_time:.2f}ms: {result.get('sentiment')}")
            
            return {
                "sentiment": result.get("sentiment"),
                "compound": result.get("compound"),
                "emotions": {
                    "happy": result.get("emotions", {}).get("happy", 0),
                    "angry": result.get("emotions", {}).get("angry", 0),
                    "surprise": result.get("emotions", {}).get("surprise", 0),
                    "sad": result.get("emotions", {}).get("sad", 0),
                    "fear": result.get("emotions", {}).get("fear", 0)
                },
                "language": result.get("language", "en")
            }
    except Exception as e:
        logger.error(f"Error calling sentiment service: {e}")
        return None

async def recognize_intent(
    text: str, 
    user_id: Optional[str] = None, 
    conversation_id: Optional[str] = None,
    previous_messages: Optional[list] = None
):
    """Call the intent recognition service to analyze text intent"""
    start_time = time.time()
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{settings.INTENT_SERVICE_URL}/recognize-intent",
                json={
                    "text": text,
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "previous_messages": previous_messages
                }
            )
            
            if response.status_code != 200:
                logger.error(f"Error from intent service: {response.status_code} - {response.text}")
                return None
                
            result = response.json()
            processing_time = (time.time() - start_time) * 1000  # in milliseconds
            logger.info(f"Intent recognition completed in {processing_time:.2f}ms: {result.get('primary_intent')}")
            
            return {
                "primary_intent": result.get("primary_intent"),
                "confidence": result.get("confidence"),
                "is_emergency": result.get("is_emergency", False),
                "suggested_response_type": result.get("suggested_response_type")
            }
    except Exception as e:
        logger.error(f"Error calling intent service: {e}")
        return None

async def analyze_text(
    text: str, 
    user_id: Optional[str] = None, 
    conversation_id: Optional[str] = None,
    previous_messages: Optional[list] = None
):
    """Analyze text with both sentiment and intent services in parallel"""
    try:
        # Run both analyses in parallel
        sentiment_task = asyncio.create_task(
            analyze_sentiment(text, user_id, conversation_id)
        )
        
        intent_task = asyncio.create_task(
            recognize_intent(text, user_id, conversation_id, previous_messages)
        )
        
        # Wait for both to complete
        sentiment_result, intent_result = await asyncio.gather(sentiment_task, intent_task)
        
        return {
            "sentiment": sentiment_result,
            "intent": intent_result
        }
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        return {
            "sentiment": None,
            "intent": None
        }
