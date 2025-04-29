import time
import text2emotion as te
from langdetect import detect, LangDetectException
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import torch
import redis
from loguru import logger
import os
import json
from datetime import datetime, timedelta
import pytz

# Initialize VADER sentiment analyzer
vader_analyzer = SentimentIntensityAnalyzer()

# Initialize Hugging Face transformer model for sentiment analysis
try:
    model_name = "distilbert-base-uncased-finetuned-sst-2-english"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(model_name)
    transformer_sentiment = pipeline("sentiment-analysis", model=model, tokenizer=tokenizer)
except Exception as e:
    logger.error(f"Error loading transformer model: {e}")
    transformer_sentiment = None

# Initialize Redis connection 
try:
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", 6379))
    redis_client = redis.Redis(host=redis_host, port=redis_port, decode_responses=True)
    redis_client.ping()  # Test connection
    redis_available = True
    logger.info("Redis connection established")
except Exception as e:
    logger.warning(f"Redis not available: {e}")
    redis_available = False
    redis_client = None

def get_language(text):
    """Detect the language of the text"""
    try:
        return detect(text)
    except LangDetectException:
        return "unknown"

def get_emotion_scores(text):
    """Get emotion scores using text2emotion"""
    try:
        emotions = te.get_emotion(text)
        return {
            "happy": emotions.get("Happy", 0),
            "angry": emotions.get("Angry", 0),
            "surprise": emotions.get("Surprise", 0),
            "sad": emotions.get("Sad", 0),
            "fear": emotions.get("Fear", 0)
        }
    except Exception as e:
        logger.error(f"Error getting emotions: {e}")
        return {
            "happy": 0,
            "angry": 0,
            "surprise": 0,
            "sad": 0,
            "fear": 0
        }

def get_transformer_sentiment(text):
    """Get sentiment using transformer model"""
    if transformer_sentiment is None:
        return None
    
    try:
        result = transformer_sentiment(text)
        if result and len(result) > 0:
            return result[0]
        return None
    except Exception as e:
        logger.error(f"Error getting transformer sentiment: {e}")
        return None

def get_vader_sentiment(text):
    """Get sentiment scores using VADER"""
    try:
        scores = vader_analyzer.polarity_scores(text)
        
        # Determine sentiment category
        compound = scores['compound']
        if compound >= 0.05:
            sentiment = "positive"
        elif compound <= -0.05:
            sentiment = "negative"
        else:
            sentiment = "neutral"
            
        return {
            "sentiment": sentiment,
            "scores": {
                "positive": scores["pos"],
                "negative": scores["neg"],
                "neutral": scores["neu"]
            },
            "compound": compound
        }
    except Exception as e:
        logger.error(f"Error getting VADER sentiment: {e}")
        return {
            "sentiment": "neutral",
            "scores": {
                "positive": 0,
                "negative": 0,
                "neutral": 1
            },
            "compound": 0
        }

def get_context_aware_sentiment(text, user_id=None, conversation_id=None):
    """Get context-aware sentiment by considering previous messages"""
    if not redis_available or not user_id or not conversation_id:
        return None
    
    try:
        # Get recent messages for this conversation
        conversation_key = f"conversation:{conversation_id}"
        recent_messages = redis_client.lrange(conversation_key, 0, 4)  # Get last 5 messages
        
        if not recent_messages:
            return None
            
        # Calculate average sentiment
        total_compound = 0
        for msg in recent_messages:
            try:
                msg_data = json.loads(msg)
                total_compound += msg_data.get("compound", 0)
            except:
                continue
                
        avg_compound = total_compound / len(recent_messages)
        
        # Determine context-aware sentiment
        if avg_compound >= 0.05:
            return "trending_positive"
        elif avg_compound <= -0.05:
            return "trending_negative"
        else:
            return "trending_neutral"
    except Exception as e:
        logger.error(f"Error getting context-aware sentiment: {e}")
        return None

def get_historical_sentiment(user_id):
    """Get historical sentiment trend for a user"""
    if not redis_available or not user_id:
        return None
        
    try:
        # Get user's sentiment history
        user_key = f"user:{user_id}:sentiment"
        sentiment_history = redis_client.lrange(user_key, 0, 9)  # Get last 10 sentiments
        
        if not sentiment_history or len(sentiment_history) < 3:
            return None
            
        # Calculate trend
        recent_compounds = []
        for item in sentiment_history:
            try:
                sentiment_data = json.loads(item)
                recent_compounds.append(sentiment_data.get("compound", 0))
            except:
                continue
                
        if not recent_compounds:
            return None
            
        # Simple trend analysis
        if len(recent_compounds) >= 3:
            recent_avg = sum(recent_compounds[:3]) / 3
            older_avg = sum(recent_compounds[-3:]) / 3
            
            if recent_avg > older_avg + 0.1:
                return "improving"
            elif recent_avg < older_avg - 0.1:
                return "deteriorating"
            else:
                return "stable"
        
        return None
    except Exception as e:
        logger.error(f"Error getting historical sentiment: {e}")
        return None

def store_sentiment(text, sentiment_data, user_id=None, conversation_id=None):
    """Store sentiment data in Redis for historical analysis"""
    if not redis_available:
        return
        
    try:
        timestamp = datetime.now(pytz.UTC).isoformat()
        
        # Store data to analyze
        data_to_store = {
            "text": text,
            "compound": sentiment_data.get("compound", 0),
            "sentiment": sentiment_data.get("sentiment", "neutral"),
            "timestamp": timestamp
        }
        
        # Store in conversation history if available
        if conversation_id:
            conversation_key = f"conversation:{conversation_id}"
            redis_client.lpush(conversation_key, json.dumps(data_to_store))
            redis_client.ltrim(conversation_key, 0, 19)  # Keep last 20 messages
            
        # Store in user history if available
        if user_id:
            user_key = f"user:{user_id}:sentiment"
            redis_client.lpush(user_key, json.dumps(data_to_store))
            redis_client.ltrim(user_key, 0, 49)  # Keep last 50 sentiments
            
            # Set expiration for user data (30 days)
            redis_client.expire(user_key, 60 * 60 * 24 * 30)
    except Exception as e:
        logger.error(f"Error storing sentiment: {e}")
