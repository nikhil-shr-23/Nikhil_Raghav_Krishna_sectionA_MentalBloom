import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from bson import ObjectId
from pymongo.collection import Collection
from pymongo.database import Database

from app.models.emotion import Emotion, EmotionCreate, EmotionResponse

logger = logging.getLogger(__name__)


class EmotionService:
    """Service for managing emotion entries."""

    def __init__(self, db: Database):
        """Initialize the emotion service with a database connection."""
        self.db = db
        self.collection: Collection = db.emotions

    async def create_emotion(self, user_id: str, emotion_data: EmotionCreate) -> EmotionResponse:
        """Create a new emotion entry."""
        emotion = Emotion(
            user_id=user_id,
            emotion=emotion_data.emotion,
            intensity=emotion_data.intensity,
            notes=emotion_data.notes,
            created_at=datetime.utcnow()
        )

        result = await self.collection.insert_one(emotion.dict())
        
        # Get the created emotion
        created_emotion = await self.collection.find_one({"_id": result.inserted_id})
        
        return self._map_emotion_to_response(created_emotion)

    async def get_emotions_by_user(self, user_id: str, limit: int = 100) -> List[EmotionResponse]:
        """Get emotions for a specific user."""
        emotions = []
        cursor = self.collection.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        
        async for emotion in cursor:
            emotions.append(self._map_emotion_to_response(emotion))
            
        return emotions

    async def get_emotions_by_date_range(
        self, user_id: str, start_date: datetime, end_date: datetime
    ) -> List[EmotionResponse]:
        """Get emotions for a specific user within a date range."""
        emotions = []
        cursor = self.collection.find({
            "user_id": user_id,
            "created_at": {
                "$gte": start_date,
                "$lte": end_date
            }
        }).sort("created_at", -1)
        
        async for emotion in cursor:
            emotions.append(self._map_emotion_to_response(emotion))
            
        return emotions

    async def get_emotions_by_type(self, user_id: str, emotion_type: str) -> List[EmotionResponse]:
        """Get emotions of a specific type for a user."""
        emotions = []
        cursor = self.collection.find({
            "user_id": user_id,
            "emotion": emotion_type
        }).sort("created_at", -1)
        
        async for emotion in cursor:
            emotions.append(self._map_emotion_to_response(emotion))
            
        return emotions

    async def get_emotion_stats(self, user_id: str, days: int = 30) -> Dict[str, Any]:
        """Get emotion statistics for a user over a period of days."""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get emotions in the date range
        emotions = await self.get_emotions_by_date_range(user_id, start_date, datetime.utcnow())
        
        # Calculate statistics
        emotion_counts = {}
        emotion_intensities = {}
        daily_emotions = {}
        
        for emotion in emotions:
            # Count emotions by type
            emotion_type = emotion.emotion
            if emotion_type not in emotion_counts:
                emotion_counts[emotion_type] = 0
                emotion_intensities[emotion_type] = []
            
            emotion_counts[emotion_type] += 1
            emotion_intensities[emotion_type].append(emotion.intensity)
            
            # Group by day
            day_str = emotion.created_at.strftime("%Y-%m-%d")
            if day_str not in daily_emotions:
                daily_emotions[day_str] = {
                    "date": day_str,
                    "emotions": {}
                }
            
            if emotion_type not in daily_emotions[day_str]["emotions"]:
                daily_emotions[day_str]["emotions"][emotion_type] = []
                
            daily_emotions[day_str]["emotions"][emotion_type].append(emotion.intensity)
        
        # Calculate average intensities
        avg_intensities = {}
        for emotion_type, intensities in emotion_intensities.items():
            avg_intensities[emotion_type] = sum(intensities) / len(intensities) if intensities else 0
        
        # Format daily data for charts
        daily_data = []
        for day, data in sorted(daily_emotions.items()):
            day_entry = {"date": day}
            
            # Calculate average intensity for each emotion type on this day
            for emotion_type, intensities in data["emotions"].items():
                day_entry[emotion_type] = sum(intensities) / len(intensities) if intensities else 0
                
            daily_data.append(day_entry)
        
        return {
            "emotion_counts": emotion_counts,
            "avg_intensities": avg_intensities,
            "daily_data": daily_data
        }

    def _map_emotion_to_response(self, emotion: Dict[str, Any]) -> EmotionResponse:
        """Map a database emotion document to an EmotionResponse."""
        return EmotionResponse(
            id=str(emotion["_id"]),
            user_id=emotion["user_id"],
            emotion=emotion["emotion"],
            intensity=emotion["intensity"],
            notes=emotion.get("notes"),
            created_at=emotion["created_at"]
        )
