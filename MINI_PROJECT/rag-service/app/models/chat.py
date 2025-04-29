from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None
    include_sources: bool = False
    max_tokens: Optional[int] = None
    temperature: Optional[float] = 0.7


class Source(BaseModel):
    title: str
    url: Optional[str] = None
    content_snippet: str


class SentimentInfo(BaseModel):
    sentiment: str
    score: float
    explanation: Optional[str] = None


class IntentInfo(BaseModel):
    intent: str
    confidence: float
    explanation: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    sources: Optional[List[Source]] = None
    conversation_id: Optional[str] = None
    sentiment: Optional[str] = None
    intent: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
