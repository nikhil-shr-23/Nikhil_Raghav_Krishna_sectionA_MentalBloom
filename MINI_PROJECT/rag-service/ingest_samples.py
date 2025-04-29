import json
import time
import os


# Try to import required packages, but provide helpful error messages if they're missing
try:
    import requests
except ImportError:
    print("Error: The 'requests' package is not installed. Please install it with 'pip install requests'")
    exit(1)

try:
    from dotenv import load_dotenv
    # Load environment variables
    load_dotenv()
except ImportError:
    print("Warning: The 'python-dotenv' package is not installed. Environment variables will not be loaded from .env file.")
    print("You can install it with 'pip install python-dotenv'")
    # Define a dummy function to avoid errors
    def load_dotenv():
        pass

def ingest_sample_data():
    """Ingest sample mental health resources into the vector store"""
    print("Starting ingestion of sample mental health resources...")

    # Get the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Load sample data using absolute path
    sample_path = os.path.join(script_dir, "data", "sample_resources.json")
    print(f"Looking for sample data at: {sample_path}")

    with open(sample_path, "r") as f:
        resources = json.load(f)

    # Get the RAG service URL
    # When running locally, use localhost. When running in Docker, use the service name
    rag_service_url = os.getenv("RAG_SERVICE_URL", "http://localhost:8002")
    print(f"Using RAG service URL: {rag_service_url}")

    # Ingest each resource
    for i, resource in enumerate(resources):
        print(f"Ingesting resource {i+1}/{len(resources)}: {resource['title']}")

        try:
            # Send ingestion request
            print(f"  Sending request to {rag_service_url}/ingest")
            response = requests.post(
                f"{rag_service_url}/ingest",
                json={
                    "title": resource["title"],
                    "content": resource["content"],
                    "url": resource.get("url"),
                    "metadata": resource.get("metadata", {})
                },
                timeout=60  # Increase timeout to 60 seconds for the first request
            )

            # Check response
            if response.status_code == 200:
                result = response.json()
                print(f"  Success! Document ID: {result['document_id']}")
            else:
                print(f"  Error: {response.status_code} - {response.text}")

            # Sleep to avoid overwhelming the service
            time.sleep(1)

        except requests.exceptions.ConnectionError:
            print(f"  Error: Could not connect to the RAG service at {rag_service_url}")
            print("  Make sure the service is running and accessible.")
            print("  If running locally, ensure the service is started with 'docker-compose up'")
            print("  If running in Docker, make sure the service name is correct in the URL")
            # Exit after the first connection error to avoid repeated failures
            break
        except requests.exceptions.HTTPError as e:
            if "500 Server Error" in str(e):
                error_text = str(e.response.text) if hasattr(e, 'response') and hasattr(e.response, 'text') else ""

                if "No active indexes found" in error_text:
                    print(f"  Error: No active indexes found in your Pinecone project.")
                    print("  The service will attempt to create an index automatically.")
                    print("  If this error persists, check your Pinecone account:")
                    print("  1. Make sure you have permission to create indexes")
                    print("  2. You may need to upgrade your Pinecone plan if you've reached the index limit")
                    print("  3. Verify your API key has write permissions")
                    # Continue with the next resource to see if the index gets created
                    continue
                else:
                    print(f"  Error: The RAG service encountered a server error.")
                    print("  This might be due to incorrect Pinecone configuration.")
                    print("  Check your .env file and make sure PINECONE_ENVIRONMENT is a valid environment like 'gcp-starter'.")
                    print("  You can find your environment in the Pinecone console: https://app.pinecone.io/")
                    print(f"  Error details: {error_text}")
                    # Exit after the first server error to avoid repeated failures
                    break
            else:
                print(f"  Error: {e}")
                continue
        except requests.exceptions.Timeout:
            print(f"  Error: Request to {rag_service_url} timed out after 60 seconds")
            print("  The service might be downloading the embedding model for the first time,")
            print("  which can take several minutes. Subsequent requests should be faster.")
            print("  You can check the logs with: docker-compose logs rag-service")
            # Continue with the next resource
            continue
        except Exception as e:
            print(f"  Error: {e}")

    print("Ingestion complete!")

if __name__ == "__main__":
    ingest_sample_data()
