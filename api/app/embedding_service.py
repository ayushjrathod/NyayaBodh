"""
Embedding service using Hugging Face's hosted API instead of local models
"""
import os
import requests
import numpy as np
from typing import List, Union
from dotenv import load_dotenv
import logging
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class HuggingFaceEmbeddingService:
    """
    Service for generating embeddings using Hugging Face's hosted API
    """
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        # Use the HuggingFace router endpoint for feature extraction
        self.api_url = f"https://router.huggingface.co/hf-inference/models/{model_name}/pipeline/feature-extraction"
        self.similarity_url = f"https://router.huggingface.co/hf-inference/models/{model_name}/pipeline/sentence-similarity"
        self.headers = {
            "Authorization": f"Bearer {os.environ.get('HF_TOKEN')}",
        }
        
        # Setup session with retry strategy
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,  # Total number of retries
            backoff_factor=1,  # Wait time between retries (exponential backoff)
            status_forcelist=[429, 500, 502, 503, 504],  # HTTP status codes to retry on
            allowed_methods=["POST"]  # Only retry on POST requests
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Validate API key
        if not os.environ.get('HF_TOKEN'):
            raise ValueError("HF_TOKEN environment variable is required")
        
        logger.info(f"Initialized HuggingFace Embedding Service with model: {model_name}")
    
    def encode_single(self, text: str, max_retries: int = 3, timeout: int = 60) -> np.ndarray:
        """
        Encode a single text string into embeddings with retry logic
        
        Args:
            text: Input text string
            max_retries: Maximum number of retries on failure
            timeout: Request timeout in seconds
            
        Returns:
            numpy array of embeddings
        """
        for attempt in range(max_retries + 1):
            try:
                # Use the correct payload format for HuggingFace feature extraction
                payload = {"inputs": text}
                
                # Use session with retry strategy
                response = self.session.post(
                    self.api_url, 
                    headers=self.headers, 
                    json=payload, 
                    timeout=timeout
                )
                
                if response.status_code == 200:
                    embeddings = response.json()
                    # Handle different response formats from HF API
                    if isinstance(embeddings, list):
                        # Direct list of embeddings
                        result = np.array(embeddings, dtype='float32')
                    elif isinstance(embeddings, dict) and 'embeddings' in embeddings:
                        # Wrapped in embeddings key
                        result = np.array(embeddings['embeddings'], dtype='float32')
                    else:
                        # Try to convert whatever we got
                        result = np.array(embeddings, dtype='float32')
                    
                    # Ensure we have the right shape (flatten if necessary)
                    if result.ndim > 1 and result.shape[0] == 1:
                        result = result.flatten()
                    
                    return result
                
                elif response.status_code == 503:
                    # Model is loading, wait and retry with longer delay
                    wait_time = 20 * (attempt + 1)  # Increase wait time with each attempt
                    logger.warning(f"Model is loading (attempt {attempt + 1}), waiting {wait_time} seconds...")
                    time.sleep(wait_time)
                    continue
                
                else:
                    logger.error(f"HF API Error: {response.status_code} - {response.text}")
                    # Try to get more details from the response
                    try:
                        error_details = response.json()
                        logger.error(f"Error details: {error_details}")
                    except:
                        pass
                    
                    if attempt == max_retries:
                        raise Exception(f"HuggingFace API error: {response.status_code} - {response.text}")
                    else:
                        # Wait before retrying
                        wait_time = 2 ** attempt  # Exponential backoff
                        logger.warning(f"Retrying after {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                        
            except requests.exceptions.Timeout as e:
                logger.warning(f"Request timeout on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries:
                    logger.error(f"Request timed out after {max_retries} attempts")
                    raise Exception(f"Network timeout calling HuggingFace API after {max_retries} attempts: {str(e)}")
                else:
                    # Wait before retrying with exponential backoff
                    wait_time = 2 ** attempt
                    logger.warning(f"Retrying after {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"Request error on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries:
                    logger.error(f"Request failed after {max_retries} attempts")
                    raise Exception(f"Network error calling HuggingFace API after {max_retries} attempts: {str(e)}")
                else:
                    # Wait before retrying
                    wait_time = 2 ** attempt
                    logger.warning(f"Retrying after {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                    
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}: {str(e)}")
                if attempt == max_retries:
                    raise
                else:
                    wait_time = 2 ** attempt
                    logger.warning(f"Retrying after {wait_time} seconds... (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
    
    def encode(self, texts: Union[str, List[str]]) -> np.ndarray:
        """
        Encode text(s) into embeddings
        
        Args:
            texts: Single text string or list of text strings
            
        Returns:
            numpy array of embeddings (2D for multiple texts, 1D for single text)
        """
        if isinstance(texts, str):
            return self.encode_single(texts)
        
        elif isinstance(texts, list):
            embeddings = []
            for text in texts:
                embedding = self.encode_single(text)
                embeddings.append(embedding)
            return np.array(embeddings, dtype='float32')
        
        else:
            raise ValueError("texts must be a string or list of strings")
    
    def compute_similarity(self, text1: str, text2: str, max_retries: int = 3, timeout: int = 60) -> float:
        """
        Compute cosine similarity between two texts using HuggingFace sentence similarity API
        
        Args:
            text1: First text
            text2: Second text
            max_retries: Maximum number of retries on failure
            timeout: Request timeout in seconds
            
        Returns:
            Cosine similarity score
        """
        try:
            # Use HF's sentence similarity endpoint as shown in documentation
            payload = {
                "inputs": {
                    "source_sentence": text1,
                    "sentences": [text2]
                }
            }
            
            response = self.session.post(
                self.similarity_url, 
                headers=self.headers, 
                json=payload, 
                timeout=timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return float(result[0])
            
            # Fallback to manual cosine similarity calculation if API fails
            logger.warning("Similarity API failed, falling back to manual calculation")
            emb1 = self.encode(text1)
            emb2 = self.encode(text2)
            
            # Flatten embeddings if they are 2D
            if emb1.ndim > 1:
                emb1 = emb1.flatten()
            if emb2.ndim > 1:
                emb2 = emb2.flatten()
            
            # Compute cosine similarity
            dot_product = np.dot(emb1, emb2)
            norm1 = np.linalg.norm(emb1)
            norm2 = np.linalg.norm(emb2)
            
            return float(dot_product / (norm1 * norm2))
            
        except Exception as e:
            logger.error(f"Error computing similarity: {str(e)}")
            raise
    
    def batch_encode(self, texts: List[str], batch_size: int = 10) -> np.ndarray:
        """
        Encode texts in batches to avoid API rate limits
        
        Args:
            texts: List of text strings
            batch_size: Number of texts to process per batch
            
        Returns:
            numpy array of all embeddings
        """
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            batch_embeddings = self.encode(batch)
            
            if batch_embeddings.ndim == 1:
                # Single embedding, reshape to 2D
                batch_embeddings = batch_embeddings.reshape(1, -1)
            
            all_embeddings.append(batch_embeddings)
        
        return np.vstack(all_embeddings)
    
    def test_connection(self) -> bool:
        """
        Test the connection to HuggingFace API
        
        Returns:
            True if connection successful, False otherwise
        """
        try:
            test_text = "Hello world"
            result = self.encode_single(test_text, max_retries=1, timeout=30)
            logger.info(f"API connection test successful. Embedding shape: {result.shape}")
            return True
        except Exception as e:
            logger.error(f"API connection test failed: {str(e)}")
            return False
    
    def encode_with_fallback(self, texts: Union[str, List[str]], max_retries: int = 3) -> np.ndarray:
        """
        Encode texts with fallback to local processing if API consistently fails
        
        Args:
            texts: Single text string or list of text strings
            max_retries: Maximum number of retries per text
            
        Returns:
            numpy array of embeddings
        """
        try:
            return self.encode(texts)
        except Exception as e:
            logger.error(f"HuggingFace API failed consistently: {str(e)}")
            logger.warning("Consider using a local embedding model as fallback")
            # For now, re-raise the exception
            # In a production system, you might want to implement a local fallback here
            raise Exception(f"Embedding service unavailable: {str(e)}")
    
    def safe_encode_single(self, text: str, default_dim: int = 384) -> np.ndarray:
        """
        Safely encode a single text with fallback to zero vector if all else fails
        
        Args:
            text: Input text string
            default_dim: Default embedding dimension for fallback
            
        Returns:
            numpy array of embeddings or zero vector
        """
        try:
            return self.encode_single(text)
        except Exception as e:
            logger.error(f"Failed to encode text '{text[:50]}...': {str(e)}")
            logger.warning(f"Returning zero vector of dimension {default_dim}")
            return np.zeros(default_dim, dtype='float32')


# Global instance to be used across the application
embedding_service = None

def get_embedding_service() -> HuggingFaceEmbeddingService:
    """
    Get the global embedding service instance
    """
    global embedding_service
    if embedding_service is None:
        model_name = os.environ.get('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
        embedding_service = HuggingFaceEmbeddingService(model_name)
    return embedding_service

def initialize_embedding_service(model_name: str = None):
    """
    Initialize the global embedding service
    """
    global embedding_service
    if model_name is None:
        model_name = os.environ.get('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')
    
    embedding_service = HuggingFaceEmbeddingService(model_name)
    logger.info(f"Embedding service initialized with model: {model_name}")
    return embedding_service
