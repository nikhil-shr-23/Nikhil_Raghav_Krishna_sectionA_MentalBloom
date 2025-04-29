from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    FUNCTION = "function"

class Message(BaseModel):
    role: MessageRole
    content: str
    name: Optional[str] = None

class ChatRequest(BaseModel):
    messages: List[Message]
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    stream: bool = False
    include_sources: bool = True
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None

class SentimentInfo(BaseModel):
    sentiment: str
    compound: float
    emotions: Dict[str, float]
    language: str

class IntentInfo(BaseModel):
    primary_intent: str
    confidence: float
    is_emergency: bool
    suggested_response_type: Optional[str] = None

class Source(BaseModel):
    title: str
    url: Optional[str] = None
    content_snippet: str
    relevance_score: float

class ChatResponse(BaseModel):
    response: str
    sources: List[Source] = []
    sentiment_analysis: Optional[SentimentInfo] = None
    intent_analysis: Optional[IntentInfo] = None
    processing_time_ms: float
    timestamp: datetime = Field(default_factory=datetime.now)
    model: str
    conversation_id: Optional[str] = None

class DocumentIngestionRequest(BaseModel):
    title: str
    content: str
    url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class DocumentIngestionResponse(BaseModel):
    document_id: str
    title: str
    chunk_count: int
    status: str
    timestamp: datetime = Field(default_factory=datetime.now)

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime = Field(default_factory=datetime.now)
    version: str
    services: Dict[str, bool]

class JournalEntry(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    content: str
    mood: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

class JournalEntryResponse(BaseModel):
    id: str
    title: str
    content: str
    mood: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None
    document_id: Optional[str] = None
    ingested: bool = False

class JournalEntryListResponse(BaseModel):
    entries: List[JournalEntryResponse]
    total: int
    page: int
    page_size: int


