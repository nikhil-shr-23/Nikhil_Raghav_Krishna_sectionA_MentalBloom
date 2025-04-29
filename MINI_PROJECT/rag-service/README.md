# MentalBloom RAG Service

A Retrieval-Augmented Generation (RAG) service for MentalBloom that provides personalized mental health support by combining Google's Gemini LLM with Pinecone vector search and emotional intelligence from ML services.

## Features

- **Retrieval-Augmented Generation**: Enhances LLM responses with relevant mental health information
- **Emotion-Aware Responses**: Adapts responses based on sentiment analysis
- **Intent-Based Guidance**: Tailors support based on detected user intent
- **Context-Aware Conversations**: Maintains conversation context for more coherent interactions
- **Emergency Detection**: Identifies and responds appropriately to crisis situations
- **Document Ingestion**: API for adding new mental health resources to the knowledge base
- **Source Citations**: Provides references to the information sources used in responses

## Architecture

The RAG service integrates several components:

1. **Gemini LLM**: Google's Generative AI model for natural language understanding and generation
2. **Pinecone Vector Database**: Stores and retrieves vector embeddings of mental health resources
3. **Sentiment Analysis Service**: Analyzes emotional tone of user messages
4. **Intent Recognition Service**: Identifies the purpose or intent behind user messages
5. **Redis**: Caches responses and stores conversation history

## API Endpoints

- `GET /` - Welcome message and API information
- `GET /health` - Health check endpoint
- `POST /chat` - Process a chat request through the RAG pipeline
- `POST /ingest` - Ingest a document into the vector store

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Google API Key for Gemini
- Pinecone API Key and Environment

### Environment Variables

Create a `.env` file based on the `.env.example` template:

```
# API Keys
GOOGLE_API_KEY=your-google-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment

# Service Configuration
PORT=8002
REDIS_HOST=redis
REDIS_PORT=6379

# Pinecone Configuration
PINECONE_INDEX_NAME=mentalbloom
PINECONE_NAMESPACE=mental-health-resources

# ML Services
SENTIMENT_SERVICE_URL=http://sentiment-analysis:8000
INTENT_SERVICE_URL=http://intent-recognition:8001
```

### Running the Service

You can run the service using Docker Compose from the project root:

```bash
docker-compose up
```

### Ingesting Sample Data

To ingest the sample mental health resources:

```bash
python ingest_samples.py
```

## API Usage

### Chat Request

```bash
curl -X POST http://localhost:8002/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You are MentalBloom, an empathetic mental health assistant."
      },
      {
        "role": "user",
        "content": "I've been feeling anxious lately and having trouble sleeping. What can I do?"
      }
    ],
    "user_id": "user123",
    "conversation_id": "conv456",
    "include_sources": true
  }'
```

### Document Ingestion

```bash
curl -X POST http://localhost:8002/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Managing Anxiety",
    "content": "Anxiety is a normal emotion that we all experience, but sometimes it can become overwhelming...",
    "url": "https://example.com/managing-anxiety",
    "metadata": {
      "category": "coping_strategies",
      "tags": ["anxiety", "mental health", "self-help"]
    }
  }'
```

## Integration with Other Services

This RAG service is designed to be integrated with:

1. **Sentiment Analysis Service**: Provides emotional context for more empathetic responses
2. **Intent Recognition Service**: Helps understand user needs for more relevant support
3. **Express.js Backend**: Acts as a proxy between the frontend and the RAG service

The service uses the outputs from the sentiment and intent services to craft more personalized and contextually appropriate responses to user queries.
