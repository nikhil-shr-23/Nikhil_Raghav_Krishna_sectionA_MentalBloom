# Auth Service

A Go-based authentication microservice for MentalBloom that provides user registration, login, and JWT token management.

## Features

- User registration with password hashing
- User login with JWT token generation
- Protected routes with JWT authentication
- MongoDB integration for user storage
- Dockerized for easy deployment

## API Endpoints

- `POST /register` - Register a new user
- `POST /login` - Login and get JWT token
- `GET /me` - Get current user information (protected)

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

The service will be available at http://localhost:8080

## API Usage

### Register a New User

```bash
curl -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Get Current User (Protected)

```bash
curl -X GET http://localhost:8080/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Environment Variables

- `PORT` - Server port (default: 8080)
- `MONGO_URI` - MongoDB connection URI (default: mongodb://localhost:27017)
- `MONGO_DB` - MongoDB database name (default: mentalbloom)
- `JWT_SECRET` - Secret key for JWT signing (default: your-secret-key)

## Security Considerations

- In production, always use a strong, unique JWT secret
- Store sensitive environment variables securely
- Use HTTPS in production environments
