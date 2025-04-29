# MentalBloom Technical Stack

## Overview

MentalBloom is built using a modern, polyglot microservices architecture. Each component is implemented using the most appropriate technology for its specific requirements, resulting in a robust and efficient system.

## Frontend

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 15.x | React framework with server-side rendering |
| Routing | App Router | - | Modern file-based routing system |
| UI Components | Shadcn UI | - | Accessible and customizable UI components |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework |
| State Management | React Hooks | - | Local and global state management |
| HTTP Client | Fetch API | - | Native browser API for HTTP requests |

## API Gateway

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Runtime | Node.js | 18.x | JavaScript runtime |
| Framework | Express.js | 4.x | Web application framework |
| Authentication | JWT | - | Token-based authentication |
| Logging | Winston | - | Structured logging |
| HTTP Client | Axios | - | Promise-based HTTP client |

## Auth Service

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Language | Go | 1.20+ | High-performance language |
| Framework | Gin | - | HTTP web framework |
| Database Driver | MongoDB Go Driver | - | MongoDB client for Go |
| Authentication | JWT-Go | - | JWT implementation for Go |
| Password Hashing | Bcrypt | - | Secure password hashing |

## RAG Service

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Language | Python | 3.9+ | Language with strong ML/AI support |
| Framework | FastAPI | - | Modern, high-performance web framework |
| RAG Framework | LangChain | - | Framework for LLM applications |
| Vector Store | Pinecone Client | - | Client for Pinecone vector database |
| LLM Client | Google Generative AI | - | Client for Gemini LLM |
| Database | PyMongo | - | MongoDB client for Python |

## Sentiment Analysis Service

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Language | Python | 3.9+ | Language with strong ML support |
| Framework | FastAPI | - | Modern, high-performance web framework |
| ML Libraries | NLTK/TextBlob | - | Natural language processing |
| Caching | Redis | - | In-memory data store |

## Intent Recognition Service

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Language | Python | 3.9+ | Language with strong ML support |
| Framework | FastAPI | - | Modern, high-performance web framework |
| ML Libraries | scikit-learn/spaCy | - | Machine learning and NLP |
| Caching | Redis | - | In-memory data store |

## Databases

| Database | Type | Purpose |
|----------|------|---------|
| MongoDB | Document Store | User data, journal entries, conversations |
| Redis | In-memory Store | Caching, session management |
| Pinecone | Vector Database | Storing and querying embeddings |

## Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Containerization | Docker | Application containerization |
| Orchestration | Docker Compose | Multi-container orchestration |
| Environment | .env files | Environment configuration |

## External Services

| Service | Provider | Purpose |
|---------|----------|---------|
| Vector Database | Pinecone | Storing and querying vector embeddings |
| Large Language Model | Google Gemini | Generating AI responses |

## Development Tools

| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Code hosting and collaboration |
| VS Code | Code editing |
| Postman | API testing |
| Docker Desktop | Container management |

## Testing Framework

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | Jest/React Testing Library | Component and integration testing |
| API Gateway | Mocha/Chai | Unit and integration testing |
| Auth Service | Go testing package | Unit testing |
| Python Services | Pytest | Unit and integration testing |

## Monitoring and Logging

| Component | Technology | Purpose |
|-----------|------------|---------|
| Logging | Winston/Logrus | Structured logging |
| Monitoring | (Future: Prometheus) | Metrics collection |
| Visualization | (Future: Grafana) | Metrics visualization |

## Security

| Component | Technology | Purpose |
|-----------|------------|---------|
| Authentication | JWT | Token-based authentication |
| Password Storage | Bcrypt | Secure password hashing |
| API Security | CORS, Helmet | HTTP security headers |
| Input Validation | Schema validation | Request validation |

## Deployment (Future)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Cloud Provider | AWS/GCP | Cloud infrastructure |
| Container Orchestration | Kubernetes | Production container orchestration |
| CI/CD | GitHub Actions | Continuous integration and deployment |
| Infrastructure as Code | Terraform | Infrastructure provisioning |

## Version Control

| Component | Technology | Purpose |
|-----------|------------|---------|
| Version Control | Git | Source code management |
| Repository Hosting | GitHub | Code hosting and collaboration |
| Branching Strategy | Feature branches | Development workflow |

This technical stack represents a modern, cloud-native approach to building a scalable and maintainable mental health support platform. The polyglot architecture allows each component to use the most appropriate technology for its specific requirements.
