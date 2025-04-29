from typing import Dict
from pydantic import BaseModel
from datetime import datetime


class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    services: Dict[str, bool]
