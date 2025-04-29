from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
import os
import time
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from loguru import logger
from datetime import datetime

# Importing models and utilites 
from app.models import TextRequest, IntentResponse, BatchTextRequest, BatchIntentResponse, IntentModel
from app.utils import (
    preprocess_text, extract_entities, detect_intent_with_ml,
    detect_intent_with_zero_shot, detect_intent_with_keywords,
    check_emergency, get_context_aware_intent, store_intent,
    INTENT_KEYWORDS, RESPONSE_TYPES
)

# Configure logger
logger.add(
    "logs/intent_recognition.log",
    rotation="500 MB",
    retention="10 days",
    level="INFO"
)

# FastAPI app
app = FastAPI(
    title="MentalBloom Advanced Intent Recognition API",
    description="API for recognizing intent in text messages with ML and context awareness",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "Welcome to MentalBloom Advanced Intent Recognition API",
        "version": "2.0.0",
        "endpoints": [
            "/recognize-intent",
            "/batch-recognize-intent",
            "/intents",
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

@app.get("/intents", response_model=IntentModel)
async def get_intents():
    """Get information about available intents"""
    return IntentModel(
        name="MentalBloom Intent Model",
        description="A model for recognizing user intents in mental health conversations",
        intents=set(INTENT_KEYWORDS.keys()),
        version="2.0.0",
        last_updated=datetime.now()
    )

def analyze_intent(text_request: TextRequest):
    """Core function to analyze text intent"""
    start_time = time.time()

    if not text_request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    is_emergency = check_emergency(text_request.text)

    entities = extract_entities(text_request.text)

    primary_intent, ml_confidence = detect_intent_with_ml(text_request.text)

    # If ML confidence is low, try zero-shot classification
    zero_shot_scores = {}
    if ml_confidence < 0.5:
        zero_shot_scores = detect_intent_with_zero_shot(text_request.text)

    keyword_scores = detect_intent_with_keywords(text_request.text)


    all_intents = {}

    for intent, score in keyword_scores.items():
        all_intents[intent] = score

    for intent, score in zero_shot_scores.items():
        if intent in all_intents:
            all_intents[intent] = (all_intents[intent] + score * 2) / 3
        else:
            all_intents[intent] = score

    if ml_confidence >= 0.5:
        if primary_intent in all_intents:
            all_intents[primary_intent] = (all_intents[primary_intent] + ml_confidence * 3) / 4
        else:
            all_intents[primary_intent] = ml_confidence

    if is_emergency:
        all_intents["emergency"] = 1.0

    if all_intents:
        primary_intent = max(all_intents, key=all_intents.get)
        confidence = all_intents[primary_intent]
    else:
        primary_intent = "unknown"
        confidence = 0.0


    context_aware_intent = get_context_aware_intent(
        text_request.text,
        previous_messages=text_request.previous_messages,
        user_id=text_request.user_id,
        conversation_id=text_request.conversation_id
    )


    suggested_response_type = RESPONSE_TYPES.get(primary_intent, "general")


    if text_request.user_id or text_request.conversation_id:
        store_intent(
            text_request.text,
            {"primary_intent": primary_intent, "confidence": confidence},
            user_id=text_request.user_id,
            conversation_id=text_request.conversation_id
        )

 
    processing_time = (time.time() - start_time) * 1000  # in milliseconds

    # Creatingg response
    return IntentResponse(
        text=text_request.text,
        primary_intent=primary_intent,
        confidence=confidence,
        all_intents=all_intents,
        is_emergency=is_emergency,
        entities=entities,
        context_aware_intent=context_aware_intent,
        suggested_response_type=suggested_response_type,
        timestamp=datetime.now(),
        processing_time_ms=processing_time
    )

@app.post("/recognize-intent", response_model=IntentResponse)
async def recognize_intent(request: TextRequest, background_tasks: BackgroundTasks):
    """Recognize intent of a single text message"""
    logger.info(f"Recognizing intent for text: {request.text[:50]}...")

    try:
        result = analyze_intent(request)

        # Log the request in the background
        background_tasks.add_task(
            logger.info,
            f"Intent recognition completed: {request.text[:30]}... -> {result.primary_intent} (confidence: {result.confidence:.2f})"
        )

        return result
    except Exception as e:
        logger.error(f"Error recognizing intent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-recognize-intent", response_model=BatchIntentResponse)
async def batch_recognize_intent(request: BatchTextRequest):
    """Recognize intent of multiple text messages in batch"""
    start_time = time.time()

    if not request.texts:
        raise HTTPException(status_code=400, detail="No texts provided for batch analysis")

    logger.info(f"Processing batch intent recognition for {len(request.texts)} texts")

    results = []
    failed_count = 0

    for text_request in request.texts:
        try:
            result = analyze_intent(text_request)
            results.append(result)
        except Exception as e:
            logger.error(f"Error recognizing intent in batch: {e}")
            failed_count += 1

    total_processing_time = (time.time() - start_time) * 1000  # in milliseconds

    return BatchIntentResponse(
        results=results,
        batch_size=len(request.texts),
        successful_count=len(results),
        failed_count=failed_count,
        total_processing_time_ms=total_processing_time
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
