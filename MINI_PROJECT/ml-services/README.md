# MentalBloom Advanced ML Microservices

This directory contains the advanced ML microservices for the MentalBloom application, which provide sophisticated emotional intelligence capabilities to the chatbot.

## Services

### 1. Advanced Sentiment Analysis

The sentiment analysis service provides deep emotional analysis of text messages, going beyond simple positive/negative/neutral categorization. It combines multiple models and techniques to provide rich insights into the emotional content of messages.

#### Features

- Multi-model sentiment analysis (VADER + Transformers)
- Emotion detection (happy, angry, surprise, sad, fear)
- Language detection for multilingual support
- Context-aware sentiment analysis using conversation history
- Historical sentiment trend analysis
- Entity extraction
- Batch processing capabilities
- Performance monitoring and logging

#### API Endpoints

- `GET /` - Welcome message and API information
- `GET /health` - Health check endpoint
- `POST /analyze-sentiment` - Analyze sentiment of a single text
- `POST /batch-analyze-sentiment` - Analyze sentiment of multiple texts

#### Technology

- FastAPI
- NLTK with VADER
- Hugging Face Transformers
- Text2Emotion
- LangDetect
- Redis for caching and context
- PyTorch

### 2. Advanced Intent Recognition

The intent recognition service uses machine learning to identify the purpose or intent behind a user's message. It combines multiple approaches (ML model, zero-shot classification, and keyword matching) to provide accurate intent recognition even for complex or ambiguous messages.

#### Features

- Machine learning-based intent classification
- Zero-shot classification for handling unseen intents
- Entity extraction
- Context-aware intent recognition using conversation history
- Emergency detection with high precision
- Response type suggestions
- Batch processing capabilities
- Performance monitoring and logging

#### API Endpoints

- `GET /` - Welcome message and API information
- `GET /health` - Health check endpoint
- `GET /intents` - Get information about available intents
- `POST /recognize-intent` - Recognize intent of a single text
- `POST /batch-recognize-intent` - Recognize intent of multiple texts

#### Technology

- FastAPI
- Scikit-learn
- NLTK
- Hugging Face Transformers
- spaCy for entity extraction
- Redis for caching and context
- PyTorch

## Getting Started

### Running the Services

You can run both services using Docker Compose from the project root:

```bash
docker-compose up
```

### Testing the Services

#### Advanced Sentiment Analysis

```bash
curl -X POST http://localhost:8000/analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling great today!",
    "user_id": "user123",
    "conversation_id": "conv456"
  }'
```

#### Advanced Intent Recognition

```bash
curl -X POST http://localhost:8001/recognize-intent \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Can you give me some advice on how to deal with stress?",
    "user_id": "user123",
    "conversation_id": "conv456",
    "previous_messages": ["I've been feeling overwhelmed lately"]
  }'
```

## Integration with Other Services

These ML services are designed to be integrated with the Express.js backend API, which will call these services to analyze user messages and determine appropriate responses. The backend will use the sentiment and intent information to:

1. Route messages to appropriate handlers based on intent
2. Adjust the tone of responses based on sentiment and emotions
3. Identify emergency situations that require immediate attention
4. Track user sentiment over time to provide more personalized support
5. Use context-aware analysis to maintain coherent conversations
6. Extract entities to provide more relevant and targeted responses

## Architecture

The ML services are designed with a microservice architecture that includes:

- **Redis**: For caching, storing conversation history, and enabling context-aware analysis
- **Docker**: For containerization and easy deployment
- **Persistent Volumes**: For storing logs and trained models
- **Health Checks**: For monitoring service status
- **Batch Processing**: For efficient handling of multiple requests
