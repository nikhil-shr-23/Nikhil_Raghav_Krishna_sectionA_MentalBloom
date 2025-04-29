FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Make sure we have the latest Pinecone client and langchain-pinecone
RUN pip uninstall -y pinecone-client pinecone || true
RUN pip install --no-cache-dir 'pinecone>=6.0.0' 'langchain-pinecone>=0.1.0'

# Copy application code
COPY ./app ./app
COPY ./data ./data

# Create directories for logs and models
RUN mkdir -p logs models

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8002

# Expose port
EXPOSE 8002

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002"]
