import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

load_dotenv()

class Settings(BaseSettings):
    """Configuration class for all AI models and parameters"""
    
    # API Configuration
    GROQ_API_KEY: str = "" 
    
    # LLM Model Configuration
    LLM_MODEL: str = "llama-3.3-70b-versatile" 
    LLM_TEMPERATURE: float = 0.5
    LLM_MAX_TOKENS: int = 1024
    LLM_TOP_P: float = 1.0
    
    # Embedding Model Configuration
    EMBEDDING_MODEL: str = "Alibaba-NLP/gte-base-en-v1.5"
    MAX_CHUNK_SIZE: int = 100
    
    # Chunking Parameters
    MAX_CHUNK_SIZE: int = 100
    TOP_N_CHUNKS: int = 5
    
    # System Messages
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str =  "http://localhost:8080"

    # Cloudinary configuration (set CLOUDINARY_CLOUD_NAME and optional CLOUDINARY_FOLDER_NAME in your .env)
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_FOLDER_NAME: str = ""

    GOOGLE_CLIENT_ID: str = "your-google-client-id"
    GOOGLE_CLIENT_SECRET: str = "your-google-client-secret"
    GOOGLE_REDIRECT_URI: str = "your-google-redirect-uri"  # Ensure this is correctly configured in Google Cloud Console
    SECRET_KEY: str = "your-default-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

@lru_cache
def get_settings():
    return Settings()

config = get_settings()
