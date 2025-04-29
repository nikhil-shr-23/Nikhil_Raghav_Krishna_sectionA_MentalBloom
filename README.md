# MentalBloom: Mental Health Resource Platform

## Project Overview

MentalBloom is a comprehensive mental health resource platform designed to provide personalized support through AI-powered conversations, emotion tracking, and journaling. The platform combines modern web technologies with advanced AI capabilities to create an accessible mental health companion.

## Architecture

MentalBloom follows a microservices architecture, with each component serving a specific purpose:

![Architecture Diagram](https://mermaid.live/view#pako:eNp9U8FuozAQ_RXLp6yURoSQBDhUSks3qtRIVbvaw5o9eGGaWBvsyJhus1H-vWMcSFBQkcDD85vx-D37QDOVA43pWvPdhvxIUknwKas_DkhporK_oMm9KnaqBPIg34VWsgBpUurI9vmOmAGZsybABGm4kKB_n1lLbuAf37PF82MT9_IWldkw-yGvoN9FBr2sl8WS4fsl5xX7FLZZ1kZkIfl2X4qyN-HRdm-YG8gLZGothRFK9rJXSq5VcscGp-BM-nbZKOSiZIN6uGagWC64kv7hw4DGZpsdlpeKP2ONTElggyYiPyEzSpPk7nLxJRRCCuYG8vS0Iqh-_9Ktdzc3t40_bqYxy05YX65RNMKB1hELtHp3YSdsF2s20EVdxw6rz4IFTzp3mR3w7HPdltXcTZwsbVE6xEMvchq_8W0JQ1qALrj9pwebkFKzgQJSGmOYwxuvtvWJP2LejstfShU0NrrCTK2q9aatU-1y1CURHG08U1BW0PeqkobGUViXoPGBftA48MLRZOZPxxM_jMZ-FAzpnsaTaBSMIz-cBdO5H82D-XFI_9dreqPpOPAmM8-L_Lk380KshvtB51fuKtc3-vgJeYAwAg)

### Key Components:

1. **Frontend**: Next.js application with Shadcn UI components
2. **API Gateway**: Node.js service that routes requests to appropriate microservices
3. **RAG Service**: Python FastAPI service for AI-powered conversations using Retrieval Augmented Generation
4. **Authentication Service**: Go service with MongoDB for user management
5. **Sentiment Analysis**: Python microservice for emotion detection
6. **Intent Recognition**: Python microservice for understanding user intent

## Key Features

### 1. AI-Powered Conversations
- Utilizes Retrieval Augmented Generation (RAG) with Gemini LLM
- Pinecone vector database for efficient knowledge retrieval
- Context-aware responses based on mental health resources

### 2. Emotion Tracking
- User-friendly interface for logging emotions with intensity levels
- Visualization of emotional patterns over time
- Local storage for privacy and offline functionality
- Data clearing option for user control

### 3. Journaling
- Structured journaling with title, content, mood, and tags
- Search functionality for finding past entries
- Local storage implementation for privacy
- Data export and clearing options

### 4. Privacy-First Approach
- Client-side storage for sensitive data (emotions and journal entries)
- No server-side storage of personal reflections
- User control over data retention

## Technical Implementation

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Components**: Shadcn UI with custom theming
- **State Management**: React hooks and context
- **Data Visualization**: Recharts for emotion tracking

### Backend
- **API Gateway**: Express.js for request routing
- **RAG Pipeline**: LangChain + Gemini + Pinecone
- **Authentication**: JWT-based auth with bcrypt password hashing
- **NLP Services**: spaCy and custom models for sentiment and intent analysis

### DevOps
- **Containerization**: Docker and Docker Compose
- **Deployment**: Container orchestration for scalability
- **Environment**: Configuration via environment variables

## Challenges and Solutions

| Challenge | Solution |
|-----------|----------|
| Service connectivity | Implemented robust error handling and fallbacks |
| Data privacy concerns | Moved sensitive data to client-side storage |
| Model compatibility | Used free, open-source models with fallback mechanisms |
| Cross-service communication | Standardized API contracts between services |

## Future Enhancements

1. **Offline Support**: Enhanced offline capabilities with service workers
2. **Data Export**: Allow users to export their emotion and journal data
3. **AI Insights**: Provide AI-generated insights based on emotional patterns
4. **Community Features**: Optional anonymous sharing of experiences
5. **Mobile App**: Native mobile experience with React Native

## Conclusion

MentalBloom demonstrates how modern web technologies and AI can be combined to create accessible mental health tools. By prioritizing privacy, usability, and thoughtful design, the platform offers a supportive environment for users to track their emotional well-being and receive contextual guidance.

---

*MentalBloom - Nurturing mental wellness through technology*
