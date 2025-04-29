# MentalBloom Architecture Diagrams

## System Architecture Diagram

```mermaid
graph TD
    User[User] -->|Interacts with| Frontend[Frontend - Next.js]
    Frontend -->|API Requests| Gateway[API Gateway - Express.js]
    
    subgraph Authentication
        Gateway -->|Auth Requests| AuthService[Auth Service - Go]
        AuthService -->|Store/Retrieve| MongoDB[(MongoDB)]
    end
    
    subgraph Chat Processing
        Gateway -->|Chat Messages| RAG[RAG Service - Python]
        RAG -->|Sentiment Analysis| Sentiment[Sentiment Analysis - Python]
        RAG -->|Intent Recognition| Intent[Intent Recognition - Python]
        RAG -->|Vector Search| Pinecone[(Pinecone Vector DB)]
        RAG -->|Generate Response| Gemini[Gemini LLM API]
        Sentiment -->|Cache Results| Redis1[(Redis)]
        Intent -->|Cache Results| Redis2[(Redis)]
    end
    
    subgraph Journal Management
        Gateway -->|Journal Operations| RAG
        RAG -->|Store Journals| MongoDB
        RAG -->|Vectorize Entries| Pinecone
    end
    
    Gateway -->|Return Response| Frontend
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant DB as MongoDB
    
    User->>Frontend: Enter credentials
    Frontend->>Gateway: POST /api/auth/login
    Gateway->>Auth: Forward request
    Auth->>DB: Verify credentials
    DB->>Auth: Return user data
    Auth->>Auth: Generate JWT token
    Auth->>Gateway: Return token + user data
    Gateway->>Frontend: Return response
    Frontend->>Frontend: Store token in localStorage
    Frontend->>User: Redirect to dashboard
```

## Chat Message Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Gateway as API Gateway
    participant RAG as RAG Service
    participant Sentiment as Sentiment Analysis
    participant Intent as Intent Recognition
    participant Pinecone
    participant Gemini as Gemini LLM
    
    User->>Frontend: Send message
    Frontend->>Gateway: POST /api/chat/message
    Gateway->>Gateway: Verify JWT token
    Gateway->>RAG: Forward message
    
    par Parallel Processing
        RAG->>Sentiment: Analyze sentiment
        Sentiment->>RAG: Return sentiment analysis
        
        RAG->>Intent: Recognize intent
        Intent->>RAG: Return intent analysis
    end
    
    RAG->>Pinecone: Query relevant documents
    Pinecone->>RAG: Return relevant documents
    
    RAG->>Gemini: Generate response with context
    Gemini->>RAG: Return generated response
    
    RAG->>Gateway: Return complete response
    Gateway->>Frontend: Return formatted response
    Frontend->>User: Display response with metadata
```

## Journal Entry Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Gateway as API Gateway
    participant RAG as RAG Service
    participant MongoDB
    participant Pinecone
    
    User->>Frontend: Create journal entry
    Frontend->>Gateway: POST /api/journal
    Gateway->>Gateway: Verify JWT token
    Gateway->>RAG: Forward journal entry
    
    RAG->>MongoDB: Store journal entry
    MongoDB->>RAG: Confirm storage
    
    RAG->>RAG: Generate embeddings
    RAG->>Pinecone: Store embeddings with metadata
    Pinecone->>RAG: Confirm storage
    
    RAG->>Gateway: Return success response
    Gateway->>Frontend: Return confirmation
    Frontend->>User: Display success message
```

## Data Model

```mermaid
erDiagram
    USER {
        string id PK
        string email
        string password_hash
        string name
        datetime created_at
        datetime updated_at
    }
    
    CONVERSATION {
        string id PK
        string user_id FK
        datetime created_at
        datetime updated_at
    }
    
    MESSAGE {
        string id PK
        string conversation_id FK
        string role
        string content
        object sentiment
        object intent
        array sources
        datetime timestamp
    }
    
    JOURNAL_ENTRY {
        string id PK
        string user_id FK
        string title
        string content
        string mood
        array tags
        datetime created_at
        datetime updated_at
    }
    
    VECTOR_EMBEDDING {
        string id PK
        string source_id FK
        string source_type
        array vector
        object metadata
        datetime created_at
    }
    
    USER ||--o{ CONVERSATION : has
    CONVERSATION ||--o{ MESSAGE : contains
    USER ||--o{ JOURNAL_ENTRY : writes
    JOURNAL_ENTRY ||--o{ VECTOR_EMBEDDING : has
    MESSAGE ||--o{ VECTOR_EMBEDDING : has
```

## Deployment Architecture

```mermaid
graph TD
    subgraph "Docker Compose Environment"
        Frontend[Frontend Container]
        Gateway[API Gateway Container]
        Auth[Auth Service Container]
        RAG[RAG Service Container]
        Sentiment[Sentiment Analysis Container]
        Intent[Intent Recognition Container]
        MongoDB[(MongoDB Container)]
        Redis[(Redis Container)]
    end
    
    subgraph "External Services"
        Pinecone[(Pinecone Vector DB)]
        Gemini[Gemini LLM API]
    end
    
    Frontend --> Gateway
    Gateway --> Auth
    Gateway --> RAG
    RAG --> Sentiment
    RAG --> Intent
    RAG --> Pinecone
    RAG --> Gemini
    Auth --> MongoDB
    RAG --> MongoDB
    Sentiment --> Redis
    Intent --> Redis
```

## Component Interaction Diagram

```mermaid
flowchart TD
    subgraph Frontend
        UI[User Interface]
        State[State Management]
        API[API Client]
    end
    
    subgraph "API Gateway"
        Routes[Routes]
        Middleware[Auth Middleware]
        ErrorHandling[Error Handling]
    end
    
    subgraph "Auth Service"
        AuthController[Auth Controller]
        JWTUtil[JWT Utilities]
        PasswordUtil[Password Utilities]
    end
    
    subgraph "RAG Service"
        ChatProcessor[Chat Processor]
        JournalManager[Journal Manager]
        VectorStore[Vector Store Client]
        LLMClient[LLM Client]
    end
    
    UI --> State
    State --> API
    API --> Routes
    Routes --> Middleware
    Middleware --> AuthController
    Routes --> ChatProcessor
    Routes --> JournalManager
    ChatProcessor --> VectorStore
    ChatProcessor --> LLMClient
    JournalManager --> VectorStore
    AuthController --> JWTUtil
    AuthController --> PasswordUtil
```

These diagrams provide a comprehensive visual representation of the MentalBloom architecture, showing the system components, their interactions, data flow, and deployment structure.
