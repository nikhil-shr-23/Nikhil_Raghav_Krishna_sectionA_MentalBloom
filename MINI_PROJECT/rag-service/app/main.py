from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from loguru import logger
import time
from datetime import datetime
import os

from app.config import settings
from app.models import (
    ChatRequest, ChatResponse,
    DocumentIngestionRequest, DocumentIngestionResponse,
    HealthResponse, JournalEntry, JournalEntryResponse, JournalEntryListResponse
)
from app.routers import emotions
from app.rag_pipeline import process_chat_request
from app.vectorstore import ingest_document, initialize_pinecone
from app.llm import initialize_gemini_llm
from app.journal import create_journal_entry, get_journal_entry, get_journal_entries, update_journal_entry, delete_journal_entry, search_journal_entries

app = FastAPI(
    title="MentalBloom RAG Service",
    description="Retrieval-Augmented Generation service for mental health support",
    version="1.0.0"
)

# Include routers
app.include_router(emotions, tags=["emotions"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services on startup
@app.on_event("startup")
async def startup_event():
    try:
        # Initialize Pinecone
        try:
            initialize_pinecone()
            logger.info("Pinecone initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Pinecone: {e}")
            if "Failed to resolve" in str(e) and "pinecone.io" in str(e):
                logger.error("DNS resolution error: Could not connect to Pinecone.")
                logger.error(f"Check that your PINECONE_ENVIRONMENT value '{settings.PINECONE_ENVIRONMENT}' is correct.")
                logger.error("The environment should be a valid Pinecone environment like 'gcp-starter', 'us-west1-gcp', etc.")
                logger.error("Find your environment in the Pinecone console: https://app.pinecone.io/")
            elif "Invalid API key" in str(e) or "Unauthorized" in str(e):
                logger.error("Authentication error: Your Pinecone API key appears to be invalid.")
                logger.error("Make sure you've set the correct PINECONE_API_KEY in your .env file.")

        # Test Gemini LLM
        try:
            initialize_gemini_llm()
            logger.info("Gemini LLM initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Gemini LLM: {e}")
            if "API key not available" in str(e) or "Invalid API key" in str(e):
                logger.error("Authentication error: Your Google API key appears to be invalid.")
                logger.error("Make sure you've set the correct GOOGLE_API_KEY in your .env file.")

        logger.info("RAG service initialization completed")
    except Exception as e:
        logger.error(f"Error during RAG service startup: {e}")

@app.get("/")
async def root():
    return {
        "message": "Welcome to MentalBloom RAG Service",
        "version": "1.0.0",
        "endpoints": [
            "/chat",
            "/ingest",
            "/health"
        ]
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    # Check services
    services = {
        "gemini": True,
        "pinecone": True,
        "sentiment_analysis": True,
        "intent_recognition": True
    }

    try:
        initialize_gemini_llm()
    except Exception as e:
        logger.error(f"Gemini health check failed: {e}")
        services["gemini"] = False

    try:
        initialize_pinecone()
    except Exception as e:
        logger.error(f"Pinecone health check failed: {e}")
        services["pinecone"] = False

    # We'll consider the service healthy if core components are working
    status = "healthy" if services["gemini"] and services["pinecone"] else "degraded"

    return HealthResponse(
        status=status,
        timestamp=datetime.now(),
        version="1.0.0",
        services=services
    )

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat request through the RAG pipeline"""
    try:
        response = await process_chat_request(
            messages=request.messages,
            user_id=request.user_id,
            conversation_id=request.conversation_id,
            include_sources=request.include_sources,
            max_tokens=request.max_tokens,
            temperature=request.temperature
        )
        return response
    except Exception as e:
        logger.error(f"Error processing chat request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ingest", response_model=DocumentIngestionResponse)
async def ingest(request: DocumentIngestionRequest, background_tasks: BackgroundTasks):
    """Ingest a document into the vector store"""
    try:
        # Start ingestion in the background
        result = ingest_document(
            title=request.title,
            content=request.content,
            url=request.url,
            metadata=request.metadata
        )

        return DocumentIngestionResponse(
            document_id=result["document_id"],
            title=result["title"],
            chunk_count=result["chunk_count"],
            status=result["status"],
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Error ingesting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/journal", response_model=JournalEntryResponse)
async def create_journal(entry: JournalEntry):
    """Create a new journal entry"""
    try:
        response = await create_journal_entry(entry)
        return response
    except Exception as e:
        logger.error(f"Error creating journal entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journal/{user_id}/{entry_id}", response_model=JournalEntryResponse)
async def get_journal(user_id: str, entry_id: str):
    """Get a journal entry by ID"""
    try:
        entry = await get_journal_entry(user_id, entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return entry
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting journal entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journal/{user_id}", response_model=JournalEntryListResponse)
async def list_journals(
    user_id: str,
    page: int = 1,
    page_size: int = 10,
    tag: Optional[str] = None,
    mood: Optional[str] = None
):
    """List journal entries for a user"""
    try:
        result = await get_journal_entries(user_id, page, page_size, tag, mood)
        return JournalEntryListResponse(**result)
    except Exception as e:
        logger.error(f"Error listing journal entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/journal/{user_id}/{entry_id}", response_model=JournalEntryResponse)
async def update_journal(user_id: str, entry_id: str, updates: Dict[str, Any]):
    """Update a journal entry"""
    try:
        entry = await update_journal_entry(user_id, entry_id, updates)
        if not entry:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return entry
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating journal entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/journal/{user_id}/{entry_id}")
async def delete_journal(user_id: str, entry_id: str):
    """Delete a journal entry"""
    try:
        success = await delete_journal_entry(user_id, entry_id)
        if not success:
            raise HTTPException(status_code=404, detail="Journal entry not found")
        return {"status": "success", "message": "Journal entry deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting journal entry: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journal/{user_id}/search", response_model=List[JournalEntryResponse])
async def search_journals(user_id: str, query: str, limit: int = 5):
    """Search journal entries"""
    try:
        results = await search_journal_entries(user_id, query, limit)
        return results
    except Exception as e:
        logger.error(f"Error searching journal entries: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8002))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
