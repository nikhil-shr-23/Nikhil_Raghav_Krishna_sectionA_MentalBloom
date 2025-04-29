from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime

class TextRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

class EmotionScores(BaseModel):
    happy: float
    angry: float
    surprise: float
    sad: float
    fear: float

class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    scores: Dict[str, float]
    compound: float
    emotions: EmotionScores
    language: str
    context_aware_sentiment: Optional[str] = None
    historical_sentiment_trend: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    model_version: str = "advanced-sentiment-1.0"
    processing_time_ms: float

class BatchTextRequest(BaseModel):
    texts: List[TextRequest]
    
class BatchSentimentResponse(BaseModel):
    results: List[SentimentResponse]
    batch_size: int
    successful_count: int
    failed_count: int
    total_processing_time_ms: float
