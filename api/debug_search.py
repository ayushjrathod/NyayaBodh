"""
Debug test for similarity search
"""
import asyncio
import os
import sys
from dotenv import load_dotenv
import logging

# Add the parent directory to Python path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import prisma
from app.vector_store_service import NeonVectorStore

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def debug_search():
    """
    Debug the search functionality
    """
    try:
        logger.info("Starting debug search test...")
        
        # 1. Connect to Prisma
        await prisma.connect()
        
        # 2. Initialize vector store
        vector_store = NeonVectorStore(prisma)
        
        # 3. Get one document with embedding to debug
        doc_with_embedding = await prisma.document.find_first(
            include={
                'embeddings': True
            }
        )
        
        if doc_with_embedding and doc_with_embedding.embeddings:
            logger.info(f"Found document: {doc_with_embedding.uuid}")
            embedding = doc_with_embedding.embeddings[0]
            logger.info(f"Embedding type: {type(embedding.embedding)}")
            logger.info(f"Embedding content preview: {str(embedding.embedding)[:200]}...")
            
            # Test the JSON conversion
            try:
                converted = vector_store._json_to_embedding(embedding.embedding)
                logger.info(f"Converted embedding shape: {converted.shape}")
                logger.info(f"Converted embedding type: {type(converted)}")
            except Exception as e:
                logger.error(f"Error converting embedding: {e}")
                
        # 4. Try a simple search
        logger.info("Testing simple search...")
        try:
            results = await vector_store.similarity_search("legal case", k=1, min_similarity=0.0)
            logger.info(f"Search returned {len(results)} results")
            if results:
                logger.info(f"First result: {results[0]}")
        except Exception as e:
            logger.error(f"Error in search: {e}")
            import traceback
            traceback.print_exc()
        
    except Exception as e:
        logger.error(f"Error during debug: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(debug_search())
