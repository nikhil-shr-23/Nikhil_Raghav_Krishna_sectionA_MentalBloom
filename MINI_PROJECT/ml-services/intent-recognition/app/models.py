from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Set
from datetime import datetime

class TextRequest(BaseModel):
    text: str
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    previous_messages: Optional[List[str]] = None
    timestamp: Optional[datetime] = Field(default_factory=datetime.now)

class Entity(BaseModel):
    text: str
    label: str
    start: int
    end: int
    confidence: float

class IntentResponse(BaseModel):
    text: str
    primary_intent: str
    confidence: float
    all_intents: Dict[str, float]
    is_emergency: bool
    entities: List[Entity] = []
    context_aware_intent: Optional[str] = None
    suggested_response_type: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    model_version: str = "advanced-intent-1.0"
    processing_time_ms: float

class BatchTextRequest(BaseModel):
    texts: List[TextRequest]
    
class BatchIntentResponse(BaseModel):
    results: List[IntentResponse]
    batch_size: int
    successful_count: int
    failed_count: int
    total_processing_time_ms: float

class IntentModel(BaseModel):
    name: str
    description: str
    intents: Set[str]
    version: str
    last_updated: datetime
