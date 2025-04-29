import os
from dotenv import load_dotenv
from loguru import logger
from typing import Dict, Any, Optional

load_dotenv()

class Settings:
    # API Keys
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    PINECONE_API_KEY: str = os.getenv("PINECONE_API_KEY", "")
    PINECONE_ENVIRONMENT: str = os.getenv("PINECONE_ENVIRONMENT", "")

    # Service Configuration
    PORT: int = int(os.getenv("PORT", 8002))
    REDIS_HOST: str = os.getenv("REDIS_HOST", "redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", 6379))

    # Pinecone Configuration
    PINECONE_INDEX_NAME: str = os.getenv("PINECONE_INDEX_NAME", "mentallbloom")
    PINECONE_NAMESPACE: str = os.getenv("PINECONE_NAMESPACE", "mental-health-resources")

    # ML Services
    SENTIMENT_SERVICE_URL: str = os.getenv("SENTIMENT_SERVICE_URL", "http://sentiment-analysis:8000")
    INTENT_SERVICE_URL: str = os.getenv("INTENT_SERVICE_URL", "http://intent-recognition:8001")


    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # LLM Configuration
    GEMINI_MODEL: str = "models/gemini-1.5-flash-002"
    GEMINI_TEMPERATURE: float = 0.7
    GEMINI_TOP_P: float = 0.95
    GEMINI_TOP_K: int = 40
    GEMINI_MAX_OUTPUT_TOKENS: int = 1024

    # Embedding Configuration
    EMBEDDING_MODEL: str = "models/embedding-001"
    EMBEDDING_DIMENSION: int = 1024  #should match with pinecone dimension

    # RAG Configuration
    MAX_DOCUMENTS: int = 5
    SIMILARITY_THRESHOLD: float = 0.7

    # Cache Configuration
    CACHE_TTL: int = 3600  # 1 hour

    def validate(self) -> None:
        """Validate that all required settings are provided"""
        if not self.GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY is not set. Gemini API will not work.")

        if not self.PINECONE_API_KEY or not self.PINECONE_ENVIRONMENT:
            logger.warning("Pinecone credentials are not set. Vector store will not work.")

settings = Settings()
settings.validate()

# Configure logger
logger.remove()  
logger.add(
    "logs/rag_service.log",
    rotation="500 MB",
    retention="10 days",
    level=settings.LOG_LEVEL
)
logger.add(lambda msg: print(msg, end=""), level=settings.LOG_LEVEL)  # Add stdout handler
