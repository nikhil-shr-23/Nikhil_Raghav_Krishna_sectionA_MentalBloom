from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
import nltk
import os
import time
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from loguru import logger
from datetime import datetime


from app.models import TextRequest, SentimentResponse, BatchTextRequest, BatchSentimentResponse
from app.utils import (
    get_vader_sentiment, get_emotion_scores, get_language,
    get_transformer_sentiment, get_context_aware_sentiment,
    get_historical_sentiment, store_sentiment
)


logger.add(
    "logs/sentiment_analysis.log",
    rotation="500 MB",
    retention="10 days",
    level="INFO"
)


try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')


app = FastAPI(
    title="MentalBloom Advanced Sentiment Analysis API",
    description="API for analyzing sentiment and emotions in text messages with context awareness",
    version="2.0.0"
)

# mIDDleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # To replace with specififc origin in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to MentalBloom Advanced Sentiment Analysis API",
        "version": "2.0.0",
        "endpoints": [
            "/analyze-sentiment",
            "/batch-analyze-sentiment",
            "/health"
        ]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

def analyze_text(text_request: TextRequest):
    """Core function to analyze text sentiment"""
    start_time = time.time()

  
    if not text_request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    vader_result = get_vader_sentiment(text_request.text)

    emotions = get_emotion_scores(text_request.text)

    language = get_language(text_request.text)

    # Get transformer sentiment (if available)
    transformer_result = get_transformer_sentiment(text_request.text)
    if transformer_result:
        if language == "en" and transformer_result["label"] in ["POSITIVE", "NEGATIVE"]:
            sentiment = transformer_result["label"].lower()
            confidence = transformer_result["score"]
            compound = confidence if sentiment == "positive" else -confidence
        else:
            sentiment = vader_result["sentiment"]
            compound = vader_result["compound"]
    else:
        sentiment = vader_result["sentiment"]
        compound = vader_result["compound"]

    context_aware = get_context_aware_sentiment(
        text_request.text,
        user_id=text_request.user_id,
        conversation_id=text_request.conversation_id
    )

    historical_trend = get_historical_sentiment(text_request.user_id) if text_request.user_id else None

    if text_request.user_id or text_request.conversation_id:
        store_sentiment(
            text_request.text,
            {"sentiment": sentiment, "compound": compound},
            user_id=text_request.user_id,
            conversation_id=text_request.conversation_id
        )

    processing_time = (time.time() - start_time) * 1000  # in milliseconds

    return SentimentResponse(
        text=text_request.text,
        sentiment=sentiment,
        scores=vader_result["scores"],
        compound=compound,
        emotions=emotions,
        language=language,
        context_aware_sentiment=context_aware,
        historical_sentiment_trend=historical_trend,
        timestamp=datetime.now(),
        processing_time_ms=processing_time
    )

@app.post("/analyze-sentiment", response_model=SentimentResponse)
async def analyze_sentiment(request: TextRequest, background_tasks: BackgroundTasks):
    """Analyze sentiment of a single text message"""
    logger.info(f"Analyzing sentiment for text: {request.text[:50]}...")

    try:
        result = analyze_text(request)

        background_tasks.add_task(
            logger.info,
            f"Sentiment analysis completed: {request.text[:30]}... -> {result.sentiment} (compound: {result.compound:.2f})"
        )

        return result
    except Exception as e:
        logger.error(f"Error analyzing sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-analyze-sentiment", response_model=BatchSentimentResponse)
async def batch_analyze_sentiment(request: BatchTextRequest):
    """Analyze sentiment of multiple text messages in batch"""
    start_time = time.time()

    if not request.texts:
        raise HTTPException(status_code=400, detail="No texts provided for batch analysis")

    logger.info(f"Processing batch sentiment analysis for {len(request.texts)} texts")

    results = []
    failed_count = 0

    for text_request in request.texts:
        try:
            result = analyze_text(text_request)
            results.append(result)
        except Exception as e:
            logger.error(f"Error analyzing text in batch: {e}")
            failed_count += 1

    total_processing_time = (time.time() - start_time) * 1000  # in milliseconds

    return BatchSentimentResponse(
        results=results,
        batch_size=len(request.texts),
        successful_count=len(results),
        failed_count=failed_count,
        total_processing_time_ms=total_processing_time
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
