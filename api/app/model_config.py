import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ModelConfig:
    """Configuration class for all AI models and parameters"""
    
    # API Configuration
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    
    # LLM Model Configuration
    LLM_MODEL = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", "0.5"))
    LLM_MAX_TOKENS = int(os.getenv("LLM_MAX_TOKENS", "1024"))
    LLM_TOP_P = float(os.getenv("LLM_TOP_P", "1"))
    
    # Embedding Model Configuration
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "Alibaba-NLP/gte-base-en-v1.5")
    
    # Chunking Parameters
    MAX_CHUNK_SIZE = int(os.getenv("MAX_CHUNK_SIZE", "100"))
    TOP_N_CHUNKS = int(os.getenv("TOP_N_CHUNKS", "5"))
    
    # Available Groq Models
    AVAILABLE_GROQ_MODELS = [
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant", 
        "llama-3.1-70b-versatile",
        "mixtral-8x7b-32768",
        "gemma2-9b-it",
        "gemma-7b-it"
    ]
    
    # System Messages
    SYSTEM_MESSAGE = """You are a helpful assistant that responds to the user based on the context provided. If the answer does not lie in the context, you will respond with that is not my area of expertise, I am a chatbot designed for Vidi-Lekhak, a platform to help users know and create legal documents. You will refer to Vidhi-Lekhak as "our" platform. You are the assistant for the vidhilekhak platform. If any document is mentioned by the user you will also give the steps to generate it."""
    
    @classmethod
    def validate_model(cls):
        """Validate that the selected model is available"""
        if cls.LLM_MODEL not in cls.AVAILABLE_GROQ_MODELS:
            print(f"Warning: {cls.LLM_MODEL} is not in the list of known Groq models.")
            print(f"Available models: {', '.join(cls.AVAILABLE_GROQ_MODELS)}")
        
        if not cls.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY environment variable is required")
        
        return True

# Initialize and validate configuration
config = ModelConfig()
config.validate_model()
