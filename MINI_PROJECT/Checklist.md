
# ✅ Mentalbloom Dev Checklist

---

## 🔐 **1. Auth Microservice (Go + MongoDB)**

- [ ] Initialize Go project (`go mod init`)
- [ ] Connect to MongoDB (store users)
- [ ] Implement `/register` endpoint
- [ ] Implement `/login` endpoint
- [ ] Generate & sign JWT tokens
- [ ] Add `/me` endpoint (auth middleware)
- [ ] Hash passwords securely (bcrypt)
- [ ] Add input validation
- [ ] Dockerize the auth service

---

## ⚙️ **2. Backend API (Express.js)**

- [ ] Set up Express.js project
- [ ] Create route for `/chat` (proxy to Langchain/Gemini)
- [ ] Create route for `/resources` (query Pinecone)
- [ ] Create route for `/auth/verify` (validate JWT from Go)
- [ ] Integrate with ML services (sentiment + intent)
- [ ] Add error handling middleware
- [ ] Add logging (e.g., Winston or Pino)
- [ ] Dockerize the backend

---

## 🖼️ **3. Frontend (Next.js)**

- [ ] Bootstrap Next.js project with TailwindCSS
- [ ] Build auth pages: Login + Register
- [ ] Add JWT-based auth flow (login -> save token -> /me)
- [ ] Build main chat UI (text input, message bubbles)
- [ ] Build resource recommendations UI
- [ ] Add loading states and error handling
- [ ] Connect frontend to backend API
- [ ] Style for responsive/mobile experience

---

## 🤖 **4. ML Microservices (Python)**

### Sentiment Analysis
- [ ] Create FastAPI service for sentiment
- [ ] Load simple sentiment model (e.g., `textblob`, `vader`)
- [ ] Expose `/analyze-sentiment` endpoint

### Intent Recognition
- [ ] Create FastAPI service for intent recognition
- [ ] Define intent categories and logic
- [ ] Expose `/recognize-intent` endpoint

- [ ] Dockerize both ML services

---

## 🧠 **5. Langchain + Gemini + Pinecone**

- [ ] Set up Langchain environment
- [ ] Connect to Gemini API
- [ ] Set up Pinecone index
- [ ] Create embedding + upsert pipeline
- [ ] Build RAG chain for resource answering
- [ ] Write prompt templates (store in `packages/prompts`)
- [ ] Integrate with Express `/chat` route

---

## 🛠️ **6. Infrastructure / DevOps**

- [ ] Write Dockerfiles for all services
- [ ] Create `docker-compose.yml` for local development
- [ ] Add `.env` and `.env.example` files
- [ ] Set up Terraform to provision MongoDB (Atlas) + Pinecone keys
- [ ] (Optional) Configure CI/CD (GitHub Actions or Railway/Vercel)

---

## 🧪 **7. Testing & Polish**

- [ ] Add unit tests to Go auth service
- [ ] Add unit tests to Express routes
- [ ] Test ML services with real-world inputs
- [ ] Run end-to-end test from frontend to ML
- [ ] Deploy to staging environment
- [ ] Add README.md with setup instructions
