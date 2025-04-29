import os
from dotenv import load_dotenv
from pinecone import Pinecone

# Load environment variables
load_dotenv()

def test_pinecone_connection():
    """Test the connection to Pinecone"""
    print("Testing Pinecone connection...")

    # Get API key and environment from environment variables
    api_key = os.getenv("PINECONE_API_KEY")
    environment = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
    index_name = os.getenv("PINECONE_INDEX_NAME", "mentallbloom")

    print(f"Using API key: {api_key[:5]}...{api_key[-5:]}")
    print(f"Using environment: {environment}")
    print(f"Using index name: {index_name}")

    try:
        # Initialize Pinecone client
        pc = Pinecone(api_key=api_key)

        # List indexes
        indexes = pc.list_indexes().names()
        print(f"Available indexes: {indexes}")

        # Check if our index exists
        index_exists = index_name in indexes
        print(f"Index '{index_name}' exists: {index_exists}")

        if index_exists:
            # Connect to the index
            index = pc.Index(index_name)

            # Get index stats
            stats = index.describe_index_stats()
            print(f"Index stats: {stats}")

            # Try a simple query
            try:
                # Create a simple vector of the right dimension
                dimension = 1024  # Based on your index configuration
                vector = [0.1] * dimension

                # Query the index
                results = index.query(
                    vector=vector,
                    top_k=1,
                    include_metadata=True,
                    namespace=""  # Use default namespace
                )

                print(f"Query results: {results}")
                print("Pinecone query successful!")
            except Exception as e:
                print(f"Error querying index: {e}")

        print("Pinecone connection test completed successfully!")
        return True
    except Exception as e:
        print(f"Error connecting to Pinecone: {e}")
        return False

if __name__ == "__main__":
    test_pinecone_connection()
