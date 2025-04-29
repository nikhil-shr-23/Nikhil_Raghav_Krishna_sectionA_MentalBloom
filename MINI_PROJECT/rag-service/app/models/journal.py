from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class JournalEntry(BaseModel):
    user_id: str
    title: str
    content: str
    mood: Optional[str] = None
    tags: Optional[List[str]] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class JournalEntryResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    mood: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None


class JournalEntryListResponse(BaseModel):
    entries: List[JournalEntryResponse]
    total: int
    page: int
    page_size: int
