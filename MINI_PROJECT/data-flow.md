# MentalBloom Data Flow Documentation

## Overview

This document details the data flow through the MentalBloom system, explaining how information moves between components and how each service processes and transforms data.

## Core Data Flows

### 1. User Authentication Flow

```
User → Frontend → API Gateway → Auth Service → MongoDB → Auth Service → API Gateway → Frontend → User
```

#### Detailed Steps:

1. **User Input**:
   - User enters email and password in the login form

2. **Frontend Processing**:
   - Frontend validates input format
   - Sends POST request to `/api/auth/login` with credentials

3. **API Gateway Processing**:
   - Receives request
   - Routes to Auth Service

4. **Auth Service Processing**:
   - Receives login request
   - Queries MongoDB for user with matching email
   - Verifies password hash against stored hash
   - Generates JWT token with user ID and email
   - Returns token and user data

5. **API Gateway Response**:
   - Forwards Auth Service response to Frontend

6. **Frontend Storage**:
   - Stores JWT token in localStorage
   - Updates application state with user information
   - Redirects to dashboard

#### Data Transformation:

```json
// Frontend Request
{
  "email": "user@example.com",
  "password": "plaintext-password"
}

// Auth Service Database Query
{
  "email": "user@example.com"
}

// Auth Service Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### 2. Chat Message Flow

```
User → Frontend → API Gateway → RAG Service → [Sentiment Analysis, Intent Recognition] → RAG Service → Pinecone → RAG Service → Gemini LLM → RAG Service → API Gateway → Frontend → User
```

#### Detailed Steps:

1. **User Input**:
   - User types a message in the chat interface

2. **Frontend Processing**:
   - Captures message text
   - Sends POST request to `/api/chat/message` with message and conversation ID
   - Includes JWT token in Authorization header

3. **API Gateway Processing**:
   - Verifies JWT token
   - Extracts user information from token
   - Routes request to RAG Service

4. **Parallel Processing**:
   - **Sentiment Analysis**:
     - Receives text from RAG Service
     - Analyzes sentiment (positive, negative, neutral)
     - Returns sentiment scores and classification
   
   - **Intent Recognition**:
     - Receives text from RAG Service
     - Identifies user intent (greeting, venting, seeking advice, etc.)
     - Returns intent classification and confidence scores

5. **RAG Service - Document Retrieval**:
   - Generates embeddings for user message
   - Queries Pinecone for relevant documents
   - Retrieves top-k most similar documents

6. **RAG Service - Response Generation**:
   - Constructs prompt with:
     - User message
     - Sentiment analysis
     - Intent recognition
     - Retrieved documents
     - Conversation history (if available)
   - Sends prompt to Gemini LLM
   - Receives generated response

7. **API Gateway Response**:
   - Forwards complete response to Frontend

8. **Frontend Display**:
   - Updates chat interface with user message and AI response
   - Displays sentiment and intent indicators
   - Provides access to sources if available

#### Data Transformation:

```json
// Frontend Request
{
  "message": "I've been feeling really anxious about my upcoming exam",
  "conversation_id": "5f8d0d55b54764421b71905a"
}

// Sentiment Analysis Request/Response
{
  "text": "I've been feeling really anxious about my upcoming exam",
  "sentiment": "negative",
  "scores": {
    "positive": 0.1,
    "negative": 0.7,
    "neutral": 0.2
  },
  "compound": -0.6
}

// Intent Recognition Request/Response
{
  "text": "I've been feeling really anxious about my upcoming exam",
  "primary_intent": "venting",
  "confidence": 0.85,
  "all_intents": {
    "venting": 0.85,
    "seeking_advice": 0.12,
    "emergency": 0.01,
    "gratitude": 0.0,
    "greeting": 0.0,
    "farewell": 0.0,
    "general_question": 0.02
  },
  "is_emergency": false
}

// Pinecone Query
{
  "vector": [0.1, 0.2, ..., 0.5],
  "top_k": 5,
  "namespace": "mental-health-resources",
  "include_metadata": true
}

// Pinecone Response
{
  "matches": [
    {
      "id": "doc1",
      "score": 0.92,
      "metadata": {
        "title": "Managing Test Anxiety",
        "url": "https://example.com/anxiety",
        "content": "Test anxiety is common among students..."
      }
    },
    // More matches...
  ]
}

// Complete Response to Frontend
{
  "response": "I understand you're feeling anxious about your upcoming exam. That's completely normal. Many students experience test anxiety. Have you tried some relaxation techniques like deep breathing or progressive muscle relaxation? Also, making sure you're well-prepared and getting enough rest can help reduce anxiety.",
  "sentiment": {
    "sentiment": "negative",
    "scores": {
      "positive": 0.1,
      "negative": 0.7,
      "neutral": 0.2
    },
    "compound": -0.6
  },
  "intent": {
    "primary_intent": "venting",
    "confidence": 0.85,
    "is_emergency": false
  },
  "sources": [
    {
      "title": "Managing Test Anxiety",
      "url": "https://example.com/anxiety",
      "content_snippet": "Test anxiety is common among students..."
    }
    // More sources...
  ],
  "conversation_id": "5f8d0d55b54764421b71905a",
  "timestamp": "2025-04-21T01:23:45.678Z"
}
```

### 3. Journal Entry Flow

```
User → Frontend → API Gateway → RAG Service → MongoDB → RAG Service → Pinecone → RAG Service → API Gateway → Frontend → User
```

#### Detailed Steps:

1. **User Input**:
   - User creates a journal entry with title, content, mood, and tags

2. **Frontend Processing**:
   - Captures journal entry data
   - Sends POST request to `/api/journal` with entry data
   - Includes JWT token in Authorization header

3. **API Gateway Processing**:
   - Verifies JWT token
   - Extracts user ID from token
   - Routes request to RAG Service

4. **RAG Service - Database Storage**:
   - Adds user ID and timestamps to journal entry
   - Stores complete entry in MongoDB
   - Receives entry ID from MongoDB

5. **RAG Service - Vector Storage**:
   - Generates embeddings for journal entry content
   - Creates metadata with entry ID, title, mood, tags, and timestamp
   - Stores embeddings and metadata in Pinecone
   - Uses namespace specific to user's journal entries

6. **API Gateway Response**:
   - Forwards success response to Frontend

7. **Frontend Display**:
   - Updates journal interface with new entry
   - Displays success message

#### Data Transformation:

```json
// Frontend Request
{
  "title": "Exam Preparation",
  "content": "Today I studied for 4 hours and feel more prepared for my exam next week. Still a bit nervous but making progress.",
  "mood": "Hopeful",
  "tags": ["study", "exam", "progress"]
}

// MongoDB Document
{
  "_id": "60d21b4667d0d8992e610c85",
  "user_id": "507f1f77bcf86cd799439011",
  "title": "Exam Preparation",
  "content": "Today I studied for 4 hours and feel more prepared for my exam next week. Still a bit nervous but making progress.",
  "mood": "Hopeful",
  "tags": ["study", "exam", "progress"],
  "created_at": "2025-04-21T02:34:56.789Z",
  "updated_at": "2025-04-21T02:34:56.789Z"
}

// Pinecone Upsert
{
  "vectors": [
    {
      "id": "journal_60d21b4667d0d8992e610c85",
      "values": [0.1, 0.2, ..., 0.5],
      "metadata": {
        "type": "journal_entry",
        "entry_id": "60d21b4667d0d8992e610c85",
        "user_id": "507f1f77bcf86cd799439011",
        "title": "Exam Preparation",
        "mood": "Hopeful",
        "tags": ["study", "exam", "progress"],
        "created_at": "2025-04-21T02:34:56.789Z",
        "content_preview": "Today I studied for 4 hours and feel more prepared for my exam next week..."
      }
    }
  ],
  "namespace": "user_507f1f77bcf86cd799439011_journals"
}

// Response to Frontend
{
  "id": "60d21b4667d0d8992e610c85",
  "title": "Exam Preparation",
  "content": "Today I studied for 4 hours and feel more prepared for my exam next week. Still a bit nervous but making progress.",
  "mood": "Hopeful",
  "tags": ["study", "exam", "progress"],
  "created_at": "2025-04-21T02:34:56.789Z"
}
```

### 4. Journal Retrieval in Chat Flow

```
User → Frontend → API Gateway → RAG Service → Pinecone (Mental Health Resources) → Pinecone (User Journals) → RAG Service → Gemini LLM → RAG Service → API Gateway → Frontend → User
```

#### Detailed Steps:

1. **User Input**:
   - User asks a question related to their journal entries
   - Example: "When did I last study for my exam?"

2. **Frontend Processing**:
   - Captures message text
   - Sends POST request to `/api/chat/message`
   - Includes JWT token in Authorization header

3. **API Gateway Processing**:
   - Verifies JWT token
   - Extracts user information from token
   - Routes request to RAG Service

4. **RAG Service - Document Retrieval**:
   - Generates embeddings for user message
   - Queries Pinecone across multiple namespaces:
     - General mental health resources
     - User's journal entries
   - Retrieves top-k most similar documents from each namespace

5. **RAG Service - Response Generation**:
   - Constructs prompt with:
     - User message
     - Retrieved journal entries
     - Retrieved general resources
     - Conversation history
   - Sends prompt to Gemini LLM
   - Receives generated response that references journal entries

6. **API Gateway Response**:
   - Forwards complete response to Frontend

7. **Frontend Display**:
   - Updates chat interface with user message and AI response
   - Highlights journal references

#### Data Transformation:

```json
// Frontend Request
{
  "message": "When did I last study for my exam?",
  "conversation_id": "5f8d0d55b54764421b71905a"
}

// Pinecone Query (User Journals)
{
  "vector": [0.1, 0.2, ..., 0.5],
  "top_k": 3,
  "namespace": "user_507f1f77bcf86cd799439011_journals",
  "include_metadata": true
}

// Pinecone Response (User Journals)
{
  "matches": [
    {
      "id": "journal_60d21b4667d0d8992e610c85",
      "score": 0.95,
      "metadata": {
        "type": "journal_entry",
        "entry_id": "60d21b4667d0d8992e610c85",
        "user_id": "507f1f77bcf86cd799439011",
        "title": "Exam Preparation",
        "mood": "Hopeful",
        "tags": ["study", "exam", "progress"],
        "created_at": "2025-04-21T02:34:56.789Z",
        "content_preview": "Today I studied for 4 hours and feel more prepared for my exam next week..."
      }
    }
    // More matches...
  ]
}

// Complete Response to Frontend
{
  "response": "According to your journal entry from April 21, 2025, you studied for 4 hours and mentioned feeling more prepared for your exam. You described your mood as 'Hopeful' and noted that while you were still a bit nervous, you were making progress.",
  "sources": [
    {
      "title": "Exam Preparation (Your Journal)",
      "content_snippet": "Today I studied for 4 hours and feel more prepared for my exam next week. Still a bit nervous but making progress.",
      "created_at": "2025-04-21T02:34:56.789Z"
    }
  ],
  "conversation_id": "5f8d0d55b54764421b71905a",
  "timestamp": "2025-04-21T03:45:67.890Z"
}
```

## Data Storage

### MongoDB Collections

1. **Users Collection**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "password": "$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC",
  "name": "John Doe",
  "created_at": "2025-04-20T10:23:45.678Z",
  "updated_at": "2025-04-20T10:23:45.678Z"
}
```

2. **Conversations Collection**
```json
{
  "_id": "5f8d0d55b54764421b71905a",
  "user_id": "507f1f77bcf86cd799439011",
  "created_at": "2025-04-21T01:23:45.678Z",
  "updated_at": "2025-04-21T01:23:45.678Z"
}
```

3. **Messages Collection**
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "conversation_id": "5f8d0d55b54764421b71905a",
  "role": "user",
  "content": "I've been feeling really anxious about my upcoming exam",
  "sentiment": {
    "sentiment": "negative",
    "scores": {
      "positive": 0.1,
      "negative": 0.7,
      "neutral": 0.2
    },
    "compound": -0.6
  },
  "intent": {
    "primary_intent": "venting",
    "confidence": 0.85,
    "is_emergency": false
  },
  "timestamp": "2025-04-21T01:23:45.678Z"
}
```

4. **Journal Entries Collection**
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "user_id": "507f1f77bcf86cd799439011",
  "title": "Exam Preparation",
  "content": "Today I studied for 4 hours and feel more prepared for my exam next week. Still a bit nervous but making progress.",
  "mood": "Hopeful",
  "tags": ["study", "exam", "progress"],
  "created_at": "2025-04-21T02:34:56.789Z",
  "updated_at": "2025-04-21T02:34:56.789Z"
}
```

### Pinecone Vector Database

1. **Mental Health Resources Namespace**
```json
{
  "id": "resource_001",
  "values": [0.1, 0.2, ..., 0.5],
  "metadata": {
    "type": "resource",
    "title": "Managing Test Anxiety",
    "url": "https://example.com/anxiety",
    "content": "Test anxiety is common among students...",
    "tags": ["anxiety", "exams", "stress"]
  }
}
```

2. **User Journal Namespace**
```json
{
  "id": "journal_60d21b4667d0d8992e610c85",
  "values": [0.1, 0.2, ..., 0.5],
  "metadata": {
    "type": "journal_entry",
    "entry_id": "60d21b4667d0d8992e610c85",
    "user_id": "507f1f77bcf86cd799439011",
    "title": "Exam Preparation",
    "mood": "Hopeful",
    "tags": ["study", "exam", "progress"],
    "created_at": "2025-04-21T02:34:56.789Z",
    "content_preview": "Today I studied for 4 hours and feel more prepared for my exam next week..."
  }
}
```

## Data Security

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "user_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "iat": 1619012345,
    "exp": 1619098745
  },
  "signature": "..."
}
```

### Password Hashing

- Passwords are hashed using bcrypt with a cost factor of 10
- Example: `$2a$10$XOPbrlUPQdwdJUpSrIF6X.LbE14qsMmKGhM1A8W9iqaG3vv1BD7WC`

## Conclusion

The MentalBloom system's data flow is designed to provide a seamless and secure experience for users while leveraging advanced AI capabilities. The combination of traditional database storage with vector embeddings allows for powerful retrieval and personalization features, making the mental health support more effective and tailored to each user's needs.
