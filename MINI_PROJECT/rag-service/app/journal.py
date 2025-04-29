from typing import List, Dict, Any, Optional
from loguru import logger
import time
import uuid
from datetime import datetime

from app.models import JournalEntry, JournalEntryResponse
from app.config import settings
from app.vectorstore import ingest_document, retrieve_relevant_documents

# In-memory storage for journal entries (in a production app, this would be a database)
journal_entries = {}

async def create_journal_entry(entry: JournalEntry) -> JournalEntryResponse:
    """Create a new journal entry and ingest it into the vector store"""
    try:
        # Generate ID if not provided
        if not entry.id:
            entry.id = str(uuid.uuid4())
        
        # Set timestamps
        entry.created_at = datetime.now()
        entry.updated_at = entry.created_at
        
        # Store the entry
        if entry.user_id not in journal_entries:
            journal_entries[entry.user_id] = {}
        
        journal_entries[entry.user_id][entry.id] = entry.dict()
        
        # Ingest the entry into the vector store
        document_id = None
        ingested = False
        
        try:
            # Format content for ingestion
            formatted_content = f"Journal Entry - {entry.title}\n\nDate: {entry.created_at.strftime('%Y-%m-%d')}\n\n{entry.content}"
            
            # Add mood if available
            if entry.mood:
                formatted_content += f"\n\nMood: {entry.mood}"
            
            # Add tags if available
            if entry.tags:
                formatted_content += f"\n\nTags: {', '.join(entry.tags)}"
            
            # Create metadata
            metadata = {
                "type": "journal_entry",
                "user_id": entry.user_id,
                "entry_id": entry.id,
                "created_at": entry.created_at.isoformat(),
                "mood": entry.mood if entry.mood else "unknown"
            }
            
            # Ingest the document
            result = ingest_document(
                title=f"Journal: {entry.title}",
                content=formatted_content,
                metadata=metadata
            )
            
            document_id = result["document_id"]
            ingested = True
            
            # Update the stored entry with document_id
            journal_entries[entry.user_id][entry.id]["document_id"] = document_id
            
            logger.info(f"Journal entry ingested with document_id: {document_id}")
        
        except Exception as e:
            logger.error(f"Error ingesting journal entry: {e}")
            # Continue even if ingestion fails
        
        # Create response
        return JournalEntryResponse(
            id=entry.id,
            title=entry.title,
            content=entry.content,
            mood=entry.mood,
            tags=entry.tags,
            created_at=entry.created_at,
            updated_at=entry.updated_at,
            document_id=document_id,
            ingested=ingested
        )
    
    except Exception as e:
        logger.error(f"Error creating journal entry: {e}")
        raise

async def get_journal_entry(user_id: str, entry_id: str) -> Optional[JournalEntryResponse]:
    """Get a journal entry by ID"""
    try:
        if user_id not in journal_entries or entry_id not in journal_entries[user_id]:
            return None
        
        entry = journal_entries[user_id][entry_id]
        
        return JournalEntryResponse(
            id=entry_id,
            title=entry["title"],
            content=entry["content"],
            mood=entry.get("mood"),
            tags=entry.get("tags", []),
            created_at=entry["created_at"],
            updated_at=entry.get("updated_at"),
            document_id=entry.get("document_id"),
            ingested=bool(entry.get("document_id"))
        )
    
    except Exception as e:
        logger.error(f"Error getting journal entry: {e}")
        raise

async def get_journal_entries(
    user_id: str, 
    page: int = 1, 
    page_size: int = 10,
    tag: Optional[str] = None,
    mood: Optional[str] = None
) -> Dict[str, Any]:
    """Get journal entries for a user with pagination and filtering"""
    try:
        if user_id not in journal_entries:
            return {
                "entries": [],
                "total": 0,
                "page": page,
                "page_size": page_size
            }
        
        # Get all entries for the user
        all_entries = list(journal_entries[user_id].values())
        
        # Sort by created_at (newest first)
        all_entries.sort(key=lambda x: x["created_at"], reverse=True)
        
        # Filter by tag if provided
        if tag:
            all_entries = [e for e in all_entries if tag in e.get("tags", [])]
        
        # Filter by mood if provided
        if mood:
            all_entries = [e for e in all_entries if e.get("mood") == mood]
        
        # Calculate pagination
        total = len(all_entries)
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        
        # Get entries for the current page
        page_entries = all_entries[start_idx:end_idx]
        
        # Convert to response objects
        entries = [
            JournalEntryResponse(
                id=e["id"],
                title=e["title"],
                content=e["content"],
                mood=e.get("mood"),
                tags=e.get("tags", []),
                created_at=e["created_at"],
                updated_at=e.get("updated_at"),
                document_id=e.get("document_id"),
                ingested=bool(e.get("document_id"))
            )
            for e in page_entries
        ]
        
        return {
            "entries": entries,
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    except Exception as e:
        logger.error(f"Error getting journal entries: {e}")
        raise

async def update_journal_entry(user_id: str, entry_id: str, updates: Dict[str, Any]) -> Optional[JournalEntryResponse]:
    """Update a journal entry"""
    try:
        if user_id not in journal_entries or entry_id not in journal_entries[user_id]:
            return None
        
        # Get the current entry
        entry = journal_entries[user_id][entry_id]
        
        # Update fields
        for key, value in updates.items():
            if key in ["title", "content", "mood", "tags"]:
                entry[key] = value
        
        # Update timestamp
        entry["updated_at"] = datetime.now()
        
        # Re-ingest if content or title changed
        if "title" in updates or "content" in updates:
            try:
                # Format content for ingestion
                formatted_content = f"Journal Entry - {entry['title']}\n\nDate: {entry['created_at'].strftime('%Y-%m-%d')}\n\n{entry['content']}"
                
                # Add mood if available
                if entry.get("mood"):
                    formatted_content += f"\n\nMood: {entry['mood']}"
                
                # Add tags if available
                if entry.get("tags"):
                    formatted_content += f"\n\nTags: {', '.join(entry['tags'])}"
                
                # Create metadata
                metadata = {
                    "type": "journal_entry",
                    "user_id": user_id,
                    "entry_id": entry_id,
                    "created_at": entry["created_at"].isoformat(),
                    "updated_at": entry["updated_at"].isoformat(),
                    "mood": entry.get("mood", "unknown")
                }
                
                # Ingest the document
                result = ingest_document(
                    title=f"Journal: {entry['title']}",
                    content=formatted_content,
                    metadata=metadata
                )
                
                entry["document_id"] = result["document_id"]
                
                logger.info(f"Updated journal entry re-ingested with document_id: {entry['document_id']}")
            
            except Exception as e:
                logger.error(f"Error re-ingesting updated journal entry: {e}")
                # Continue even if ingestion fails
        
        # Return updated entry
        return JournalEntryResponse(
            id=entry_id,
            title=entry["title"],
            content=entry["content"],
            mood=entry.get("mood"),
            tags=entry.get("tags", []),
            created_at=entry["created_at"],
            updated_at=entry["updated_at"],
            document_id=entry.get("document_id"),
            ingested=bool(entry.get("document_id"))
        )
    
    except Exception as e:
        logger.error(f"Error updating journal entry: {e}")
        raise

async def delete_journal_entry(user_id: str, entry_id: str) -> bool:
    """Delete a journal entry"""
    try:
        if user_id not in journal_entries or entry_id not in journal_entries[user_id]:
            return False
        
        # Delete the entry
        del journal_entries[user_id][entry_id]
        
        # Note: We don't delete from the vector store as it would be complex
        # In a production app, we would mark the document as deleted or implement a proper deletion mechanism
        
        return True
    
    except Exception as e:
        logger.error(f"Error deleting journal entry: {e}")
        raise

async def search_journal_entries(user_id: str, query: str, limit: int = 5) -> List[JournalEntryResponse]:
    """Search journal entries using the vector store"""
    try:
        # Retrieve relevant documents
        relevant_docs = retrieve_relevant_documents(
            query=query,
            k=limit,
            filter={"user_id": user_id, "type": "journal_entry"}
        )
        
        results = []
        
        for doc in relevant_docs:
            # Extract entry_id from metadata
            entry_id = doc.get("metadata", {}).get("entry_id")
            
            if entry_id and user_id in journal_entries and entry_id in journal_entries[user_id]:
                entry = journal_entries[user_id][entry_id]
                
                results.append(JournalEntryResponse(
                    id=entry_id,
                    title=entry["title"],
                    content=entry["content"],
                    mood=entry.get("mood"),
                    tags=entry.get("tags", []),
                    created_at=entry["created_at"],
                    updated_at=entry.get("updated_at"),
                    document_id=entry.get("document_id"),
                    ingested=True
                ))
        
        return results
    
    except Exception as e:
        logger.error(f"Error searching journal entries: {e}")
        raise
