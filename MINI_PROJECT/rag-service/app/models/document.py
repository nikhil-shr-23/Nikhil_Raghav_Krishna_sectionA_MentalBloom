from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime


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
    timestamp: datetime
