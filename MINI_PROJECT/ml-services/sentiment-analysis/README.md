# Sentiment Analysis Service

A FastAPI-based microservice for MentalBloom that analyzes the sentiment of text messages.

## Features

- Text sentiment analysis using VADER
- Returns sentiment category (positive, negative, neutral)
- Returns detailed sentiment scores
- Dockerized for easy deployment

## API Endpoints

- `GET /` - Welcome message
- `POST /analyze-sentiment` - Analyze sentiment of text

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Running the Service

1. Clone the repository
2. Navigate to the project root directory
3. Run the service using Docker Compose:

```bash
docker-compose up
```

The service will be available at http://localhost:8000

## API Usage

### Analyze Sentiment

```bash
curl -X POST http://localhost:8000/analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling great today!"
  }'
```

Example response:

```json
{
  "text": "I am feeling great today!",
  "sentiment": "positive",
  "scores": {
    "positive": 0.592,
    "negative": 0.0,
    "neutral": 0.408
  },
  "compound": 0.6249
}
```

## Environment Variables

- `PORT` - Server port (default: 8000)
