from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class Emotion(BaseModel):
    """Model for emotion entries."""
    user_id: str
    emotion: str
    intensity: int = Field(ge=1, le=10)
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        schema_extra = {
            "example": {
                "user_id": "507f1f77bcf86cd799439011",
                "emotion": "happy",
                "intensity": 8,
                "notes": "Had a great day at work",
                "created_at": "2025-04-21T14:30:00.000Z"
            }
        }


class EmotionCreate(BaseModel):
    """Model for creating emotion entries."""
    emotion: str
    intensity: int = Field(ge=1, le=10)
    notes: Optional[str] = None


class EmotionResponse(BaseModel):
    """Model for emotion response."""
    id: str
    user_id: str
    emotion: str
    intensity: int
    notes: Optional[str]
    created_at: datetime


class EmotionsResponse(BaseModel):
    """Model for multiple emotions response."""
    emotions: List[EmotionResponse]
