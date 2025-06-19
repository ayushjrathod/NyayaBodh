"""
Migration script to move from FAISS to Neon DB
This script will read your existing CSV data and populate the Neon DB with embeddings
"""
import asyncio
import os
import sys
import pandas as pd
from dotenv import load_dotenv
import logging

# Add the parent directory to Python path to import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import prisma
from app.vector_store_service import initialize_vector_store
from app.embedding_service import initialize_embedding_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def migrate_faiss_to_neon():
    """
    Main migration function to move from FAISS to Neon DB
    """
    try:
        logger.info("Starting migration from FAISS to Neon DB...")
        
        # 1. Connect to Prisma
        logger.info("Connecting to database...")
        await prisma.connect()
        logger.info("Database connected successfully")
        
        # 2. Initialize services
        logger.info("Initializing embedding service...")
        embedding_service = initialize_embedding_service()
        
        logger.info("Initializing vector store...")
        vector_store = await initialize_vector_store(prisma)
        
        # 3. Check for CSV data file
        csv_file_path = "./data/resources/ner_data.csv"
        if not os.path.exists(csv_file_path):
            logger.error(f"CSV file not found: {csv_file_path}")
            return
        
        logger.info(f"Found CSV file: {csv_file_path}")
        
        # 4. Test embedding service connection
        logger.info("Testing embedding service connection...")
        if not embedding_service.test_connection():
            logger.error("Embedding service connection failed!")
            return
        
        logger.info("Embedding service connection successful")
        
        # 5. Perform bulk migration
        logger.info("Starting bulk migration...")
        stats = await vector_store.bulk_migrate_from_csv(csv_file_path)
        
        # 6. Display results
        logger.info("Migration completed!")
        logger.info(f"Statistics:")
        logger.info(f"  Total rows processed: {stats['total_rows']}")
        logger.info(f"  Successfully migrated: {stats['successful']}")
        logger.info(f"  Failed: {stats['failed']}")
        logger.info(f"  Skipped: {stats['skipped']}")
        
        # 7. Get final database stats
        db_stats = await vector_store.get_stats()
        logger.info(f"Database statistics:")
        logger.info(f"  Total documents: {db_stats['total_documents']}")
        logger.info(f"  Total embeddings: {db_stats['total_embeddings']}")
        logger.info(f"  Embeddings by model: {db_stats['embeddings_by_model']}")
        
        # 8. Test a sample search
        logger.info("Testing search functionality...")
        sample_results = await vector_store.similarity_search("contract dispute", k=3)
        logger.info(f"Sample search returned {len(sample_results)} results")
        
        if sample_results:
            logger.info("Sample result:")
            result = sample_results[0]
            logger.info(f"  UUID: {result['uuid']}")
            logger.info(f"  Similarity: {result['similarity_score']:.4f}")
            logger.info(f"  Summary: {result['summary'][:100]}...")
        
        logger.info("Migration and testing completed successfully!")
        
    except Exception as e:
        logger.error(f"Error during migration: {str(e)}")
        raise
    finally:
        # Disconnect from Prisma
        if prisma.is_connected():
            await prisma.disconnect()
            logger.info("Database disconnected")

async def test_migration():
    """
    Test function to verify migration worked correctly
    """
    try:
        logger.info("Testing migration results...")
        
        # Connect to database
        await prisma.connect()
        vector_store = await initialize_vector_store(prisma)
        
        # Get statistics
        stats = await vector_store.get_stats()
        print(f"\nDatabase Statistics:")
        print(f"Total Documents: {stats['total_documents']}")
        print(f"Total Embeddings: {stats['total_embeddings']}")
        print(f"Embeddings by Model: {stats['embeddings_by_model']}")
        
        # Test search
        print(f"\nTesting search...")
        results = await vector_store.similarity_search("property dispute", k=5)
        print(f"Search returned {len(results)} results")
        
        for i, result in enumerate(results[:3]):
            print(f"\nResult {i+1}:")
            print(f"  UUID: {result['uuid']}")
            print(f"  Similarity: {result['similarity_score']:.4f}")
            print(f"  Case: {result.get('petitioner', 'N/A')} vs {result.get('respondent', 'N/A')}")
            print(f"  Summary: {result['summary'][:150]}...")
        
        # Test recommendation
        if results:
            test_uuid = results[0]['uuid']
            print(f"\nTesting recommendations for UUID: {test_uuid}")
            recommendations = await vector_store.recommend_similar_cases(test_uuid, k=3)
            print(f"Recommendations returned {len(recommendations)} results")
            
            for i, rec in enumerate(recommendations):
                print(f"  Recommendation {i+1}: {rec['uuid']} (similarity: {rec['similarity_score']:.4f})")
        
    except Exception as e:
        logger.error(f"Error during testing: {str(e)}")
        raise
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

async def clear_database():
    """
    Clear all documents and embeddings from the database
    WARNING: This will delete all data!
    """
    try:
        logger.warning("CLEARING ALL DATA FROM DATABASE...")
        
        await prisma.connect()
        
        # Delete all embeddings first (due to foreign key constraints)
        deleted_embeddings = await prisma.documentembedding.delete_many()
        logger.info(f"Deleted {deleted_embeddings} embeddings")
        
        # Delete all documents
        deleted_docs = await prisma.document.delete_many()
        logger.info(f"Deleted {deleted_docs} documents")
        
        logger.info("Database cleared successfully")
        
    except Exception as e:
        logger.error(f"Error clearing database: {str(e)}")
        raise
    finally:
        if prisma.is_connected():
            await prisma.disconnect()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="FAISS to Neon DB Migration Tool")
    parser.add_argument("action", choices=["migrate", "test", "clear"], 
                       help="Action to perform")
    
    args = parser.parse_args()
    
    if args.action == "migrate":
        asyncio.run(migrate_faiss_to_neon())
    elif args.action == "test":
        asyncio.run(test_migration())
    elif args.action == "clear":
        confirm = input("Are you sure you want to clear all data? Type 'yes' to confirm: ")
        if confirm.lower() == 'yes':
            asyncio.run(clear_database())
        else:
            print("Operation cancelled")
