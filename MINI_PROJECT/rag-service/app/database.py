import os
import motor.motor_asyncio
from pymongo.database import Database
from pymongo.errors import ConnectionFailure
from loguru import logger

# MongoDB connection string
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "mentalbloom")

# Create a client instance
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)

async def get_database() -> Database:
    """
    Get the MongoDB database instance.
    """
    try:
        # Ping the server to check if the connection is alive
        await client.admin.command('ping')
        logger.info(f"Connected to MongoDB at {MONGO_URI}")
        
        # Return the database instance
        return client[MONGO_DB]
    except ConnectionFailure:
        logger.error(f"Failed to connect to MongoDB at {MONGO_URI}")
        raise
