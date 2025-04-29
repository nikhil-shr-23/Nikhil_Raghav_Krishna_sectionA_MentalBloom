# Intent Recognition Service

A FastAPI-based microservice for MentalBloom that recognizes the intent of text messages.

## Features

- Text intent recognition
- Identifies multiple intent categories:
  - Venting
  - Seeking advice
  - Emergency
  - Gratitude
  - Greeting
  - Farewell
  - General question
- Emergency detection for crisis situations
- Dockerized for easy deployment

## API Endpoints

- `GET /` - Welcome message
- `POST /recognize-intent` - Recognize intent of text

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

The service will be available at http://localhost:8001

## API Usage

### Recognize Intent

```bash
curl -X POST http://localhost:8001/recognize-intent \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Can you give me some advice on how to deal with stress?"
  }'
```

Example response:

```json
{
  "text": "Can you give me some advice on how to deal with stress?",
  "primary_intent": "seeking_advice",
  "confidence": 0.375,
  "all_intents": {
    "venting": 0.0,
    "seeking_advice": 0.375,
    "emergency": 0.0,
    "gratitude": 0.0,
    "greeting": 0.0,
    "farewell": 0.0,
    "general_question": 0.143
  },
  "is_emergency": false
}
```

## Environment Variables

- `PORT` - Server port (default: 8001)
