import logging
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse

from app.database import get_database
from app.models.emotion import EmotionCreate, EmotionResponse
from app.services.emotion_service import EmotionService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/emotions", response_model=EmotionResponse)
async def create_emotion(
    user_id: str,
    emotion_data: EmotionCreate,
    db=Depends(get_database)
):
    """Create a new emotion entry."""
    emotion_service = EmotionService(db)
    try:
        emotion = await emotion_service.create_emotion(user_id, emotion_data)
        return emotion
    except Exception as e:
        logger.error(f"Error creating emotion: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating emotion: {str(e)}")


@router.get("/emotions", response_model=List[EmotionResponse])
async def get_emotions(
    user_id: str,
    limit: int = Query(100, ge=1, le=1000),
    db=Depends(get_database)
):
    """Get emotions for a user."""
    emotion_service = EmotionService(db)
    try:
        emotions = await emotion_service.get_emotions_by_user(user_id, limit)
        return emotions
    except Exception as e:
        logger.error(f"Error getting emotions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting emotions: {str(e)}")


@router.get("/emotions/stats")
async def get_emotion_stats(
    user_id: str,
    days: int = Query(30, ge=1, le=365),
    db=Depends(get_database)
):
    """Get emotion statistics for a user."""
    emotion_service = EmotionService(db)
    try:
        stats = await emotion_service.get_emotion_stats(user_id, days)
        return stats
    except Exception as e:
        logger.error(f"Error getting emotion stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting emotion stats: {str(e)}")


@router.get("/emotions/by-type", response_model=List[EmotionResponse])
async def get_emotions_by_type(
    user_id: str,
    emotion_type: str,
    db=Depends(get_database)
):
    """Get emotions of a specific type for a user."""
    emotion_service = EmotionService(db)
    try:
        emotions = await emotion_service.get_emotions_by_type(user_id, emotion_type)
        return emotions
    except Exception as e:
        logger.error(f"Error getting emotions by type: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting emotions by type: {str(e)}")


@router.get("/emotions/by-date-range", response_model=List[EmotionResponse])
async def get_emotions_by_date_range(
    user_id: str,
    start_date: datetime,
    end_date: Optional[datetime] = None,
    db=Depends(get_database)
):
    """Get emotions for a user within a date range."""
    if end_date is None:
        end_date = datetime.utcnow()
        
    emotion_service = EmotionService(db)
    try:
        emotions = await emotion_service.get_emotions_by_date_range(user_id, start_date, end_date)
        return emotions
    except Exception as e:
        logger.error(f"Error getting emotions by date range: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting emotions by date range: {str(e)}")
