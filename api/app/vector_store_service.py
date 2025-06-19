"""
Vector Store Service for managing embeddings in Neon DB
Replaces FAISS with PostgreSQL-based vector storage
"""
import os
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Tuple
from dotenv import load_dotenv
import logging
import json
from prisma import Prisma, Json
from app.embedding_service import get_embedding_service
import asyncio

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class NeonVectorStore:
    """
    Vector store service using Neon DB for embedding storage and similarity search
    """
    
    def __init__(self, prisma_client: Prisma = None):
        self.prisma = prisma_client
        self.embedding_service = get_embedding_service()
        self.model_name = os.environ.get('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
        self.dimension = 384  # Default dimension for all-MiniLM-L6-v2
        
        logger.info(f"Initialized NeonVectorStore with model: {self.model_name}")
    
    def _embedding_to_json(self, embedding: np.ndarray) -> Json:
        """Convert numpy embedding to JSON for Prisma storage"""
        if embedding.ndim > 1:
            embedding = embedding.flatten()
        # Use prisma.Json wrapper for proper type handling
        return Json({"vector": embedding.astype(float).tolist()})
    
    def _json_to_embedding(self, json_data: Dict) -> np.ndarray:
        """Convert JSON dict to numpy embedding"""
        if isinstance(json_data, dict) and "vector" in json_data:
            return np.array(json_data["vector"], dtype='float32')
        elif isinstance(json_data, list):
            # Backward compatibility with old format
            return np.array(json_data, dtype='float32')
        else:
            raise ValueError(f"Invalid embedding format: {type(json_data)}")
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        if a.ndim > 1:
            a = a.flatten()
        if b.ndim > 1:
            b = b.flatten()
        
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(dot_product / (norm_a * norm_b))
    
    async def add_document(
        self, 
        uuid: str, 
        text: str,
        filename: Optional[str] = None,
        petitioner: Optional[str] = None,
        respondent: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> int:
        """
        Add a document with its embedding to the database
        
        Args:
            uuid: Unique identifier for the document
            text: Text content to embed (usually summary)
            filename: Original filename
            petitioner: Petitioner name
            respondent: Respondent name
            metadata: Additional metadata as JSON
            
        Returns:
            Document ID
        """
        try:
            # Generate embedding
            embedding = self.embedding_service.encode(text)
            embedding_json = self._embedding_to_json(embedding)
            dimension = len(embedding.flatten())  # Calculate dimension from original embedding
            
            # Check if document already exists
            existing_doc = await self.prisma.document.find_unique(
                where={'uuid': uuid}
            )
            
            if existing_doc:
                # Update existing document
                update_data = {
                    'filename': filename,
                    'petitioner': petitioner,
                    'respondent': respondent,
                    'summary': text
                }
                
                # Only add metadata if it's provided and not None
                if metadata is not None:
                    update_data['metadata'] = Json(metadata)
                    
                document = await self.prisma.document.update(
                    where={'uuid': uuid},
                    data=update_data
                )
                
                # Delete old embeddings and create new ones
                await self.prisma.documentembedding.delete_many(
                    where={'document_id': document.id}
                )
                
                await self.prisma.documentembedding.create(
                    data={
                        'document_id': document.id,
                        'embedding': embedding_json,
                        'model_name': self.model_name,
                        'dimension': dimension
                    }
                )
                
                logger.info(f"Updated document {uuid} with new embedding")
                return document.id
            else:
                # Create new document
                create_data = {
                    'uuid': uuid,
                    'filename': filename,
                    'petitioner': petitioner,
                    'respondent': respondent,
                    'summary': text
                }
                
                # Only add metadata if it's provided and not None
                if metadata is not None:
                    create_data['metadata'] = Json(metadata)
                    
                document = await self.prisma.document.create(data=create_data)
                
                # Create embedding
                await self.prisma.documentembedding.create(
                    data={
                        'document_id': document.id,
                        'embedding': embedding_json,
                        'model_name': self.model_name,
                        'dimension': dimension
                    }
                )
                
                logger.info(f"Added new document {uuid} with embedding")
                return document.id
                
        except Exception as e:
            logger.error(f"Error adding document {uuid}: {str(e)}")
            raise
    
    async def similarity_search(
        self, 
        query_text: str, 
        k: int = 5,
        min_similarity: float = 0.0
    ) -> List[Dict]:
        """
        Perform similarity search using cosine similarity
        
        Args:
            query_text: Query text to search for
            k: Number of results to return
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of documents with similarity scores
        """
        try:
            # Generate query embedding
            query_embedding = self.embedding_service.encode(query_text)
            
            # Get all documents with embeddings
            documents_with_embeddings = await self.prisma.document.find_many(
                include={
                    'embeddings': {
                        'where': {'model_name': self.model_name}
                    }
                }
            )
            
            results = []
            
            for doc in documents_with_embeddings:
                if not doc.embeddings:
                    continue
                
                # Get the most recent embedding for this model
                embedding_record = doc.embeddings[0]
                doc_embedding = self._json_to_embedding(embedding_record.embedding)
                
                # Calculate similarity
                similarity = self._cosine_similarity(query_embedding, doc_embedding)
                
                if similarity >= min_similarity:
                    results.append({
                        'uuid': doc.uuid,
                        'petitioner': doc.petitioner,
                        'respondent': doc.respondent,
                        'summary': doc.summary,
                        'filename': doc.filename,
                        'metadata': doc.metadata,
                        'similarity': similarity,
                        'document_id': doc.id
                    })
            
            # Sort by similarity score (descending) and return top k
            results.sort(key=lambda x: x['similarity'], reverse=True)
            return results[:k]
            
        except Exception as e:
            logger.error(f"Error in similarity search: {str(e)}")
            raise
    
    async def get_document_by_uuid(self, uuid: str) -> Optional[Dict]:
        """Get document by UUID including its embedding"""
        try:
            document = await self.prisma.document.find_unique(
                where={'uuid': uuid},
                include={'embeddings': True}
            )
            
            if not document:
                return None
            
            return {
                'uuid': document.uuid,
                'petitioner': document.petitioner,
                'respondent': document.respondent,
                'summary': document.summary,
                'filename': document.filename,
                'metadata': document.metadata,
                'document_id': document.id,
                'has_embedding': len(document.embeddings) > 0
            }
            
        except Exception as e:
            logger.error(f"Error getting document {uuid}: {str(e)}")
            raise
    
    async def recommend_similar_cases(self, uuid: str, k: int = 5) -> List[Dict]:
        """
        Find similar cases to a given document UUID
        
        Args:
            uuid: UUID of the reference document
            k: Number of similar cases to return
            
        Returns:
            List of similar documents with similarity scores
        """
        try:
            # Get the reference document
            reference_doc = await self.get_document_by_uuid(uuid)
            
            if not reference_doc:
                raise ValueError(f"Document with UUID {uuid} not found")
            
            if not reference_doc.get('summary'):
                raise ValueError(f"Document {uuid} has no summary to compare")
            
            # Perform similarity search using the document's summary
            similar_docs = await self.similarity_search(
                query_text=reference_doc['summary'],
                k=k + 1,  # +1 because the result will include the reference document itself
                min_similarity=0.1  # Minimum similarity threshold
            )
            
            # Filter out the reference document itself
            filtered_results = [
                doc for doc in similar_docs 
                if doc['uuid'] != uuid
            ]
            
            return filtered_results[:k]
            
        except Exception as e:
            logger.error(f"Error recommending similar cases for {uuid}: {str(e)}")
            raise
    
    async def bulk_migrate_from_csv(self, csv_file_path: str) -> Dict[str, int]:
        """
        Migrate data from CSV file to Neon DB
        
        Args:
            csv_file_path: Path to the CSV file
            
        Returns:
            Dictionary with migration statistics
        """
        try:
            df = pd.read_csv(csv_file_path)
            stats = {
                'total_rows': len(df),
                'successful': 0,
                'failed': 0,
                'skipped': 0
            }
            
            for index, row in df.iterrows():
                try:
                    uuid = row.get('uuid')
                    summary = row.get('summary')
                    
                    if pd.isna(uuid) or pd.isna(summary):
                        stats['skipped'] += 1
                        continue
                    
                    # Extract other fields
                    filename = row.get('Filename') if not pd.isna(row.get('Filename')) else None
                    petitioner = row.get('PETITIONER') if not pd.isna(row.get('PETITIONER')) else None
                    respondent = row.get('RESPONDENT') if not pd.isna(row.get('RESPONDENT')) else None
                    
                    # Create metadata from remaining columns
                    metadata = {}
                    for col in df.columns:
                        if col not in ['uuid', 'summary', 'Filename', 'PETITIONER', 'RESPONDENT']:
                            val = row.get(col)
                            if not pd.isna(val):
                                # Ensure JSON serializable values
                                if isinstance(val, (int, float, str, bool)):
                                    metadata[col] = val
                                else:
                                    metadata[col] = str(val)
                    
                    await self.add_document(
                        uuid=str(uuid),
                        text=str(summary),
                        filename=filename,
                        petitioner=petitioner,
                        respondent=respondent,
                        metadata=metadata if metadata else None
                    )
                    
                    stats['successful'] += 1
                    
                    # Progress indicator
                    if stats['successful'] % 10 == 0:
                        logger.info(f"Migrated {stats['successful']}/{stats['total_rows']} documents")
                        
                except Exception as e:
                    logger.error(f"Error migrating row {index}: {str(e)}")
                    stats['failed'] += 1
                    continue
            
            logger.info(f"Migration completed: {stats}")
            return stats
            
        except Exception as e:
            logger.error(f"Error in bulk migration: {str(e)}")
            raise
    
    async def get_stats(self) -> Dict:
        """Get statistics about stored documents and embeddings"""
        try:
            total_docs = await self.prisma.document.count()
            total_embeddings = await self.prisma.documentembedding.count()
            
            # Simple count by model using find_many and grouping in Python
            all_embeddings = await self.prisma.documentembedding.find_many()
            
            model_counts = {}
            for emb in all_embeddings:
                model_name = emb.model_name
                model_counts[model_name] = model_counts.get(model_name, 0) + 1
            
            return {
                'total_documents': total_docs,
                'total_embeddings': total_embeddings,
                'embeddings_by_model': model_counts
            }
            
        except Exception as e:
            logger.error(f"Error getting stats: {str(e)}")
            raise


# Global instance
_vector_store = None

def get_vector_store(prisma_client: Prisma = None) -> NeonVectorStore:
    """Get the global vector store instance"""
    global _vector_store
    if _vector_store is None:
        _vector_store = NeonVectorStore(prisma_client)
    return _vector_store

async def initialize_vector_store(prisma_client: Prisma) -> NeonVectorStore:
    """Initialize the global vector store"""
    global _vector_store
    _vector_store = NeonVectorStore(prisma_client)
    logger.info("Vector store initialized with Neon DB")
    return _vector_store
