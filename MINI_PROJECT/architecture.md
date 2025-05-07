# MentalBloom Architecture Documentation

## System Overview

MentalBloom is a comprehensive mental health support platform that combines AI-powered chat capabilities with personal journaling features. The system is built using a microservices architecture to ensure scalability, maintainability, and separation of concerns.

## Architecture Diagram =

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│   API Gateway   │────▶│  Auth Service   │
│  (Next.js App)  │     │   (Node.js)     │     │     (Go)        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         │                      │                        │
         │                      ▼                        ▼
         │              ┌─────────────────┐     ┌─────────────────┐
         │              │                 │     │                 │
         └──────────────│  RAG Service    │     │     MongoDB     │
                        │   (Python)      │     │                 │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
                                │
                                │
          ┌────────────────────┬┴───────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│                 │   │                 │   │                 │
│   Sentiment     │   │     Intent      │   │    Pinecone     │
│   Analysis      │   │  Recognition    │   │  Vector Store   │
│   (Python)      │   │    (Python)     │   │                 │
│                 │   │                 │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
         │                    │                    │
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│                 │   │                 │   │                 │
│      Redis      │   │      Redis      │   │   Gemini LLM    │
│                 │   │                 │   │                 │
│                 │   │                 │   │                 │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

## Component Descriptions

### 1. Frontend (Next.js)
- **Technology**: Next.js 15.x with App Router
- **Purpose**: Provides the user interface for the application
- **Features**:
  - Chat interface for interacting with the AI assistant
  - Journal interface for creating and viewing journal entries
  - Authentication screens (login/register)
  - Dashboard with mental health resources

### 2. API Gateway (Node.js)
- **Technology**: Express.js
- **Purpose**: Central entry point for all API requests
- **Features**:
  - Request routing to appropriate microservices
  - Authentication middleware
  - Response formatting
  - Error handling

### 3. Auth Service (Golang)
- **Technology**: Go with Gin framework
- **Purpose**: Handles user authentication and authorization
- **Features**:
  - User registration
  - User login
  - JWT token generation and validation
  - User profile management

### 4. RAG Service (Python)
- **Technology**: FastAPI, LangChain
- **Purpose**: Retrieval-Augmented Generation for AI responses
- **Features**:
  - Vector storage and retrieval
  - LLM integration (Gemini)
  - Journal entry management
  - Context-aware response generation

### 5. Sentiment Analysis Service (Python)
- **Technology**: FastAPI, scikit-learn/NLTK
- **Purpose**: Analyzes the sentiment of user messages
- **Features**:
  - Sentiment classification (positive, negative, neutral)
  - Emotion detection
  - Sentiment scoring

### 6. Intent Recognition Service (Python)
- **Technology**: FastAPI, scikit-learn/spaCy
- **Purpose**: Identifies the intent behind user messages
- **Features**:
  - Intent classification (e.g., greeting, venting, seeking advice)
  - Emergency detection
  - Confidence scoring

### 7. Databases
- **MongoDB**: Stores user data, authentication information, and journal entries
- **Redis**: Caching for ML models and temporary data
- **Pinecone**: Vector database for storing embeddings for RAG

### 8. External Services
- **Gemini LLM**: Google's large language model for generating responses

## Data Flow

### Authentication Flow
```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────┐
│         │     │             │     │             │     │         │
│ User    │────▶│  Frontend   │────▶│ API Gateway │────▶│  Auth   │
│         │     │             │     │             │     │ Service │
│         │     │             │     │             │     │         │
└─────────┘     └─────────────┘     └─────────────┘     └─────────┘
                                                             │
                                                             │
                                                             ▼
                                                        ┌─────────┐
                                                        │         │
                                                        │ MongoDB │
                                                        │         │
                                                        │         │
                                                        └─────────┘
```

### Chat Message Flow
```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│         │     │             │     │             │     │             │
│ User    │────▶│  Frontend   │────▶│ API Gateway │────▶│ RAG Service │
│         │     │             │     │             │     │             │
│         │     │             │     │             │     │             │
└─────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                             │
                      ┌───────────────────────┬──────────────┘
                      │                       │
                      ▼                       ▼
              ┌─────────────────┐    ┌─────────────────┐
              │                 │    │                 │
              │   Sentiment     │    │     Intent      │
              │   Analysis      │    │  Recognition    │
              │                 │    │                 │
              └─────────────────┘    └─────────────────┘
                      │                       │
                      └───────────────┬───────┘
                                      │
                                      ▼
                             ┌─────────────────┐
                             │                 │
                             │  Pinecone +     │
                             │  Gemini LLM     │
                             │                 │
                             └─────────────────┘
                                      │
                                      │
                                      ▼
                             ┌─────────────────┐
                             │                 │
                             │    Response     │
                             │                 │
                             │                 │
                             └─────────────────┘
```

### Journal Entry Flow
```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│         │     │             │     │             │     │             │
│ User    │────▶│  Frontend   │────▶│ API Gateway │────▶│ RAG Service │
│         │     │             │     │             │     │             │
│         │     │             │     │             │     │             │
└─────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                             │
                                                             │
                                                             ▼
                                                      ┌─────────────┐
                                                      │             │
                                                      │  MongoDB    │
                                                      │             │
                                                      │             │
                                                      └─────────────┘
                                                             │
                                                             │
                                                             ▼
                                                      ┌─────────────┐
                                                      │             │
                                                      │  Pinecone   │
                                                      │             │
                                                      │             │
                                                      └─────────────┘
```

## Technical Details

### Docker Containerization
All services are containerized using Docker, with a docker-compose.yml file orchestrating the entire application. This ensures:
- Consistent environments across development and production
- Isolated dependencies
- Easy scaling and deployment

### API Endpoints

#### Auth Service
- `POST /register` - Register a new user
- `POST /login` - Authenticate a user
- `GET /me` - Get current user profile

#### API Gateway
- `POST /api/chat/message` - Send a message to the AI
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/resources` - Get relevant resources
- `POST /api/journal` - Create a journal entry
- `GET /api/journal` - List journal entries
- `GET /api/journal/:entryId` - Get a specific journal entry
- `PUT /api/journal/:entryId` - Update a journal entry
- `DELETE /api/journal/:entryId` - Delete a journal entry
- `GET /api/journal/search` - Search journal entries

#### Sentiment Analysis Service
- `POST /analyze-sentiment` - Analyze text sentiment

#### Intent Recognition Service
- `POST /recognize-intent` - Recognize intent from text

#### RAG Service
- `POST /chat` - Process a chat message with RAG
- `GET /retrieve` - Retrieve relevant documents
- `POST /journal` - Create a journal entry
- `GET /journal/:userId` - Get user's journal entries
- `GET /journal/:userId/:entryId` - Get a specific journal entry
- `PUT /journal/:userId/:entryId` - Update a journal entry
- `DELETE /journal/:userId/:entryId` - Delete a journal entry
- `GET /journal/:userId/search` - Search journal entries

### Security Considerations
- JWT-based authentication
- Secure password hashing with bcrypt
- HTTPS for all communications (in production)
- Environment-based configuration
- Input validation and sanitization

## Deployment Architecture

In a production environment, the architecture would be enhanced with:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Load          │────▶│   API Gateway   │────▶│  Microservices  │
│   Balancer      │     │   Cluster       │     │  Cluster        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         │                      │                        │
         │                      ▼                        ▼
         │              ┌─────────────────┐     ┌─────────────────┐
         │              │                 │     │                 │
         └──────────────│  Monitoring &   │     │   Database      │
                        │  Logging        │     │   Cluster       │
                        │                 │     │                 │
                        └─────────────────┘     └─────────────────┘
```

- **Load Balancer**: Distributes traffic across multiple instances
- **API Gateway Cluster**: Multiple instances for high availability
- **Microservices Cluster**: Horizontally scaled services
- **Database Cluster**: Replicated databases for redundancy
- **Monitoring & Logging**: Centralized monitoring and logging

## Future Architecture Considerations

1. **Service Mesh**: Implement Istio or Linkerd for advanced service-to-service communication
2. **Event-Driven Architecture**: Implement Kafka or RabbitMQ for asynchronous processing
3. **Serverless Functions**: Move appropriate services to serverless architecture
4. **Multi-Region Deployment**: Deploy across multiple regions for global availability
5. **Advanced Caching**: Implement Redis Cluster for distributed caching

## Conclusion

MentalBloom's architecture is designed with scalability, maintainability, and performance in mind. The microservices approach allows for independent development and deployment of components, while the containerized infrastructure ensures consistency across environments.

The integration of AI services (sentiment analysis, intent recognition, and RAG) with traditional web services creates a powerful platform for mental health support, combining the best of both worlds to provide users with a personalized and helpful experience.
