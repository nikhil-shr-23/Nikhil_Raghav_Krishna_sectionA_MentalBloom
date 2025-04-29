# MentalBloom API Gateway

This is the Express API Gateway for the MentalBloom application. It serves as a bridge between the frontend and the various microservices.

## Features

- Authentication with JWT
- Integration with Auth Service (Go)
- Integration with ML Services (Sentiment Analysis & Intent Recognition)
- Integration with RAG Service (Langchain + Gemini + Pinecone)
- Centralized error handling
- Logging with Winston

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

### Chat

- `POST /api/chat/message` - Process a chat message through the entire pipeline
- `GET /api/chat/history` - Get chat history for a user
- `GET /api/chat/resources` - Get relevant resources based on a query

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose

### Installation

1. Clone the repository
2. Navigate to the api-gateway directory
3. Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
AUTH_SERVICE_URL=http://auth-service:8080
SENTIMENT_SERVICE_URL=http://sentiment-analysis:8000
INTENT_SERVICE_URL=http://intent-recognition:8001
RAG_SERVICE_URL=http://rag-service:8002
JWT_SECRET=your_jwt_secret_here
```

### Running the API Gateway

#### Development

```bash
npm run dev
```

#### Production

```bash
npm start
```

#### Docker

```bash
docker-compose up api-gateway
```

## Architecture

The API Gateway serves as the entry point for all client requests. It:

1. Authenticates requests using JWT tokens
2. Routes requests to the appropriate microservices
3. Aggregates responses from multiple services
4. Returns a unified response to the client

### Service Integration Flow

For chat messages:

1. Verify JWT token with Auth Service
2. Call Sentiment Analysis Service to analyze the message sentiment
3. Call Intent Recognition Service to determine the user's intent
4. Call RAG Service with the message, sentiment, and intent
5. Return the final response to the client
