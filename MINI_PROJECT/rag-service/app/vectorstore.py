from pinecone import Pinecone as PineconeClient
from langchain_pinecone import PineconeVectorStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List, Dict, Any, Optional
from loguru import logger
import time
import uuid
import json

from app.config import settings

# Initialize Google Generative AI Embeddings
def get_embedding_model():
    """Initialize the embedding model"""
    try:
        # Use a simple embedding model that doesn't require downloading large files
        from langchain_community.embeddings import FakeEmbeddings
        import numpy as np

        # Create a custom FakeEmbeddings class that returns regular floats instead of numpy float64
        class CustomFakeEmbeddings(FakeEmbeddings):
            def embed_documents(self, texts):
                embeddings = super().embed_documents(texts)
                # Convert numpy float64 to regular float
                return [[float(value) for value in embedding] for embedding in embeddings]

            def embed_query(self, text):
                embedding = super().embed_query(text)
                # Convert numpy float64 to regular float
                return [float(value) for value in embedding]

        # Create fake embeddings with the correct dimension
        embeddings = CustomFakeEmbeddings(size=1024)
        logger.info(f"Fake embedding model initialized with 1024 dimensions")
        logger.info(f"Note: This is a placeholder. In production, use a real embedding model.")
        return embeddings
    except Exception as e:
        logger.error(f"Error initializing embedding model: {e}")
        raise

def initialize_pinecone():
    """Initialize Pinecone client and connect to the index"""
    try:
        # Initialize Pinecone with the API key
        pc = PineconeClient(api_key=settings.PINECONE_API_KEY)

        # Get list of indexes
        indexes = pc.list_indexes().names()
        logger.info(f"Available Pinecone indexes: {indexes}")

        # Check if index exists
        index_exists = settings.PINECONE_INDEX_NAME in indexes

        # If index doesn't exist, create it (though this shouldn't happen with your existing index)
        if not index_exists:
            logger.info(f"Creating Pinecone index: {settings.PINECONE_INDEX_NAME}")
            # Create the index with the specified dimensions
            pc.create_index(
                name=settings.PINECONE_INDEX_NAME,
                dimension=settings.EMBEDDING_DIMENSION,
                metric="cosine"
            )

        # Connect to the index
        index = pc.Index(settings.PINECONE_INDEX_NAME)
        logger.info(f"Connected to Pinecone index: {settings.PINECONE_INDEX_NAME}")

        return index
    except Exception as e:
        error_msg = f"Error initializing Pinecone: {e}"
        logger.error(error_msg)

        # Provide more helpful error messages for common issues
        if "Failed to resolve" in str(e) and "pinecone.io" in str(e):
            logger.error("DNS resolution error: Could not connect to Pinecone.")
            logger.error(f"Check that your PINECONE_ENVIRONMENT value '{settings.PINECONE_ENVIRONMENT}' is correct.")
            logger.error("The environment should be a valid Pinecone environment like 'gcp-starter', 'us-west1-gcp', etc.")
            logger.error("Find your environment in the Pinecone console: https://app.pinecone.io/")
        elif "Invalid API key" in str(e) or "Unauthorized" in str(e):
            logger.error("Authentication error: Your Pinecone API key appears to be invalid.")
            logger.error("Make sure you've set the correct PINECONE_API_KEY in your .env file.")

        raise

def get_vectorstore():
    """Get the Pinecone vector store with the embedding model"""
    try:
        embeddings = get_embedding_model()

        try:
            # Initialize Pinecone with the API key
            pc = PineconeClient(api_key=settings.PINECONE_API_KEY)

            # Get list of indexes
            indexes = pc.list_indexes().names()
            index_exists = settings.PINECONE_INDEX_NAME in indexes

            if not index_exists:
                logger.warning(f"Index {settings.PINECONE_INDEX_NAME} not found. Creating it...")
                # Create the index with the specified dimensions
                pc.create_index(
                    name=settings.PINECONE_INDEX_NAME,
                    dimension=settings.EMBEDDING_DIMENSION,
                    metric="cosine"
                )
                logger.info(f"Successfully created Pinecone index: {settings.PINECONE_INDEX_NAME}")

            # Create Langchain Pinecone vectorstore

            # Create the vectorstore with the index
            vectorstore = PineconeVectorStore(
                pinecone_api_key=settings.PINECONE_API_KEY,
                index_name=settings.PINECONE_INDEX_NAME,
                embedding=embeddings,
                text_key="text",
                namespace=settings.PINECONE_NAMESPACE
            )

            logger.info(f"Vector store initialized with namespace: {settings.PINECONE_NAMESPACE}")
            return vectorstore

        except Exception as e:
            error_msg = str(e)
            logger.warning(f"Error accessing existing index: {error_msg}")
            raise

    except Exception as e:
        logger.error(f"Error getting vector store: {e}")
        if "No active indexes found" in str(e) or "Index not found" in str(e):
            error_msg = "No active indexes found in your Pinecone project. "
            error_msg += "Please check your Pinecone account and make sure you have permission to create indexes. "
            error_msg += "You may need to upgrade your Pinecone plan if you've reached the index limit."
            raise Exception(error_msg)
        raise

def ingest_document(title: str, content: str, url: Optional[str] = None, metadata: Optional[Dict] = None):
    """Ingest a document into the vector store"""
    start_time = time.time()

    try:
        # Generate a document ID
        doc_id = str(uuid.uuid4())

        # Create metadata
        meta = {
            "document_id": doc_id,
            "title": title,
            "url": url,
            "timestamp": time.time()
        }

        # Add custom metadata if provided
        if metadata:
            meta.update(metadata)

        # Split the document into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        # Create Langchain document
        doc = Document(page_content=content, metadata=meta)

        # Split into chunks
        chunks = text_splitter.split_documents([doc])
        logger.info(f"Split document into {len(chunks)} chunks")

        # Generate IDs for chunks
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]

        # Create Langchain Pinecone vectorstore and add documents
        try:
            # Get a fresh vectorstore
            vectorstore = get_vectorstore()

            # Add documents to the vectorstore
            logger.info(f"Adding {len(chunks)} document chunks to Pinecone index")
            vectorstore.add_documents(chunks, ids=ids)
            logger.info("Successfully added documents to Pinecone index")
        except Exception as e:
            logger.error(f"Error adding documents to vectorstore: {e}")
            raise

        processing_time = (time.time() - start_time) * 1000  # in milliseconds
        logger.info(f"Document ingested in {processing_time:.2f}ms: {title} ({len(chunks)} chunks)")

        return {
            "document_id": doc_id,
            "title": title,
            "chunk_count": len(chunks),
            "status": "success"
        }
    except Exception as e:
        logger.error(f"Error ingesting document: {e}")
        raise

def retrieve_relevant_documents(query: str, k: int = 5, filter: Optional[Dict[str, Any]] = None):
    """Retrieve relevant documents from the vector store"""
    start_time = time.time()

    try:
        # Get vectorstore
        vectorstore = get_vectorstore()

        # Prepare filter dict for Pinecone if provided
        filter_dict = None
        if filter:
            filter_dict = {}
            for key, value in filter.items():
                filter_dict[f"metadata.{key}"] = value
            logger.info(f"Using filter: {filter_dict}")

        # Perform similarity search
        docs = vectorstore.similarity_search_with_score(
            query=query,
            k=k,
            filter=filter_dict
        )

        # Format results
        results = []
        for doc, score in docs:
            # Convert score to a similarity score (Pinecone returns distance)
            similarity = 1 - score  # Convert distance to similarity

            if similarity < settings.SIMILARITY_THRESHOLD:
                continue

            results.append({
                "title": doc.metadata.get("title", "Untitled"),
                "url": doc.metadata.get("url"),
                "content": doc.page_content,
                "content_snippet": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                "relevance_score": similarity,
                "metadata": doc.metadata
            })

        processing_time = (time.time() - start_time) * 1000  # in milliseconds
        logger.info(f"Retrieved {len(results)} documents in {processing_time:.2f}ms for query: {query[:50]}...")

        return results
    except Exception as e:
        logger.error(f"Error retrieving documents: {e}")
        return []
