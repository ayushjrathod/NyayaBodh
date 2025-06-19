import os
from threading import Thread
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Remove FAISS imports - now using Neon DB
# import faiss # Removed - using Neon DB instead
import numpy as np # Added numpy import
import pandas as pd # Added pandas import
# from transformers import AutoTokenizer, AutoModel # Removed - using HF API instead

from app.auth import auth_router, admin_router # Import the auth routers
from app.database import prisma, logger # Import shared prisma and logger
from app.model_config import ModelConfig as config # Import model configuration
from app.vector_store_service import initialize_vector_store, get_vector_store # Import vector store
from contextlib import asynccontextmanager # Import asynccontextmanager

from app.global_classes import (VALID_PARAMS, SearchRequest_NER, SearchResult_NER,
                     calculate_similarity, load_ner_data)
from fastapi import FastAPI, HTTPException, Request, Depends # Added Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fuzzywuzzy import fuzz, process
from pydantic import BaseModel
from PyPDF2 import PdfReader
import asyncio
import torch

# Paths
ner_data_path = "./data/resources/ner_data.csv"
pdf_directory = "./data/resources/03-09-24"
context_directory = "./data/current_context"

# Configuration
MODEL_NAME = config.EMBEDDING_MODEL

# Global variables (replaced FAISS with vector store)
vector_store = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage database connections and load initial data."""
    global df, vector_store
    # Connect to Prisma
    retries = 5
    retry_delay = 1
    for attempt in range(retries):
        try:
            logger.info(f"Connecting to database (attempt {attempt + 1}/{retries})")
            await prisma.connect()
            logger.info("Database connection successful")
            break
        except Exception as e:
            if attempt == retries - 1:
                logger.error(f"Failed to connect after {retries} attempts: {e}")
                # Depending on policy, you might want to raise an error here
                # or let the app start and fail on db operations.
            else:
                logger.warning(f"Connection failed: {e}, retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
    
    # Load NER data
    try:
        df = pd.read_csv(ner_data_path)
        logger.info(f"Successfully loaded NER data from {ner_data_path}")
    except Exception as e:
        logger.error(f"Failed to load NER data: {e}")
        df = pd.DataFrame() # Initialize with empty DataFrame to prevent errors

    # Initialize vector store (replaces FAISS initialization)
    try:
        vector_store = await initialize_vector_store(prisma)
        logger.info("Vector store initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize vector store: {e}")
        vector_store = None
    
    yield
    
    # Disconnect from Prisma
    if prisma.is_connected():
        await prisma.disconnect()
        logger.info("Database disconnected")

# Initialize FastAPI
app = FastAPI(
    title="NyayBodh API", # Updated title
    description="Main API for NyayBodh including Authentication and other services", # Updated description
    debug=True, # Keep debug true for development
    lifespan=lifespan # Added lifespan manager
)

# Include the authentication routers
app.include_router(auth_router)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# df = pd.read_csv(ner_data_path) # This will be loaded in lifespan
# chatbot = AIChatbot() # Ensure AIChatbot is defined or remove if not used

# Health check endpoint for Docker
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker and load balancers."""
    try:
        # Check if database is connected
        if prisma.is_connected():
            return {"status": "healthy", "database": "connected"}
        else:
            return JSONResponse(
                status_code=503,
                content={"status": "unhealthy", "database": "disconnected"}
            )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

# Legacy FAISS initialization function - REMOVED
# Replaced with vector_store initialization in lifespan

@app.get("/recommend/{uuid}")
async def recommend_cases(uuid: str):
    try:
        # Load CSV()
        df=pd.read_csv('./data/resources/ner_data.csv')
        #  df = load_ner_data()
        
        # Check if UUID exists
        target_case = df[df["uuid"] == uuid]
        if target_case.empty:
            raise HTTPException(status_code=404, detail="UUID not found")
        
        # Filter columns for similarity calculation
        columns_to_compare = ["PROVISION", "STATUTE", "PRECEDENT", "GPE"]
        target_case_row = target_case.iloc[0]
        
        # Prepare the data for fuzzy matching
        data_to_compare = df.drop(index=target_case.index)
        
        # Calculate similarity using a combined string approach
        data_to_compare["similarity"] = data_to_compare.apply(
            lambda row: fuzz.ratio(
                " ".join(map(str, target_case_row[columns_to_compare])),
                " ".join(map(str, row[columns_to_compare]))
            ), axis=1
        )
        
        # Get top 5 similar cases
        top_cases = data_to_compare.nlargest(5, "similarity")
        
        # Convert DataFrame to list of dictionaries with NaN handled
        def convert_row(row):
            return {k: (None if pd.isna(v) else v) for k, v in row.items()}
        
        response = {
            "target_case": convert_row(target_case.iloc[0]),
            "recommended_cases": [convert_row(row) for _, row in top_cases.iterrows()]
        }
        
        return JSONResponse(content=response)
    
    except HTTPException as http_e:
        return JSONResponse(
            status_code=http_e.status_code, 
            content={"error": http_e.detail}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"error": str(e)}
        )

# Update this helper function
def safe_get_value(df_value, default_for_none=""):
    """
    Handle NaN values from pandas DataFrame before passing to Pydantic models
    Returns empty string for None values by default which works for string fields
    """
    if pd.isna(df_value):
        return default_for_none
    return df_value

@app.post("/search/entity", response_model=List[SearchResult_NER])
async def search_entity(request: SearchRequest_NER):
    """
    Search for entities across all columns of the CSV using fuzzy matching.
    """
    # Validate the DataFrame
    if df.empty:
        raise HTTPException(status_code=500, detail="The CSV data is empty or not loaded.")
    
    # Use a set to track unique UUIDs to prevent duplicates
    unique_uuids = set()
    response = []
    
    for column_name in df.columns:
        # Extract data for fuzzy matching
        column_data = df[column_name].fillna("").tolist()
        
        # Perform fuzzy matching on the current column
        results = process.extractBests(request.query, column_data, scorer=fuzz.partial_ratio, limit=10)
        
        for match, score in results:
            if score >= 50:  # Optional: Set a score threshold
                # Find the index of the match in the original dataframe
                index = df[column_name].eq(match).idxmax()
                
                # Check if this UUID is already in our results
                current_uuid = df.loc[index, "uuid"]
                if current_uuid not in unique_uuids:
                    unique_uuids.add(current_uuid)
                    response.append(SearchResult_NER(
                        uuid=current_uuid,
                        petitioner=safe_get_value(df.loc[index, "PETITIONER"]),
                        respondent=safe_get_value(df.loc[index, "RESPONDENT"]),
                        entities=safe_get_value(df.loc[index, column_name]),
                        summary=safe_get_value(df.loc[index, "summary"])
                    ))    
    if not response:
        raise HTTPException(status_code=404, detail="No matching results found.")
    
    return response

# Additional imports for semantic search
from typing import List, Optional
from app.embedding_service import get_embedding_service, initialize_embedding_service

class SearchRequestSEM(BaseModel):
    query: str
    param: Optional[str] = ""  # Add this field with a default empty string

class ActSearchRequestSEM(BaseModel):
    act_name: str

class SearchResponseSEM(BaseModel):
    SemanticResultData: List[dict]

# Define fuzzy search function
def fuzzy_search(text, search_term, threshold=80):
    return fuzz.partial_ratio(text.lower(), search_term.lower()) >= threshold

# Updated semantic search using vector store instead of FAISS
@app.post("/search/semantic")
async def search_endpoint(request: SearchRequestSEM):
    global vector_store
    
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    query = request.query
    print(f"Query: {query}")

    try:
        # Use vector store for similarity search
        results = await vector_store.similarity_search(query, k=10, min_similarity=0.1)
        
        semantic_result_data = []
        for result in results:
            # Structure the response to match the expected format
            result_data = {
                "uuid": result['uuid'],
                "summary": result['summary'],
                "score": float(result['similarity_score']),  # Convert to float for JSON compatibility
                "metadata": result['metadata'] or {},
            }
            semantic_result_data.append(result_data)

        return {"SemanticResultData": semantic_result_data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/recommend/embedding/{uuid}")
async def recommend_cases_embedding(uuid: str):
    """
    Embedding-based case recommendation using vector store
    """
    global vector_store
    
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized")

    try:
        # Get the target case
        case_data = await vector_store.get_document_by_uuid(uuid)
        if not case_data:
            raise HTTPException(status_code=404, detail="UUID not found")

        # Get similar cases
        similar_cases = await vector_store.recommend_similar_cases(uuid, k=5)
        
        # Format response
        formatted_similar_cases = []
        for case in similar_cases:
            formatted_similar_cases.append({
                "uuid": case["uuid"],
                "case_name": f"{case.get('petitioner', 'N/A')} vs {case.get('respondent', 'N/A')}",
                "summary": case["summary"],
                "similarity_score": case["similarity_score"]
            })

        return {
            "target_case": {
                "uuid": case_data["uuid"],
                "case_name": f"{case_data.get('petitioner', 'N/A')} vs {case_data.get('respondent', 'N/A')}",
                "summary": case_data["summary"]
            },
            "similar_cases": formatted_similar_cases,
            "method": "embedding-based (Neon DB Vector Store)"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in embedding recommendation: {str(e)}")

@app.post("/search-acts")
async def search_acts(request: ActSearchRequestSEM):
    act_name = request.act_name.strip()
    
    # Ensure the 'List of Acts' column exists
    if 'List of Acts' not in df.columns:
        raise HTTPException(status_code=500, detail="CSV does not contain 'List of Acts' column")

    # Search for the act name in the 'List of Acts' column using fuzzy matching
    results = []
    for _, row in df.iterrows():
        list_of_acts = row.get("List of Acts", "")
        if fuzzy_search(list_of_acts, act_name):
            result = { "SemanticResultData":
                [
                {"uuid": row.get("uuid"),
                "description": row.get("summary", ""),
                "metadata": row.get("metadata", ""),
                "acts": row.get("List of Acts", "")}
                ]
            }
            print(result)
            results.append(result)
    
    if not results:
        raise HTTPException(status_code=404, detail="No matching acts found")
    
    return {"results": results}

pdf_folder = './03-09-24'

@app.get("/get-file/{uuid}")
async def get_file(uuid: str):
    # Check if the serial number is in the DataFrame
    row = df[df['uuid'] == uuid]
    if row.empty:
        raise HTTPException(status_code=404, detail="UUID not found")
    
    # Extract the filename from the DataFrame
    filename = row['Filename'].values[0]
    file_path = os.path.join(pdf_folder, filename)
    
    # Check if the file exists
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="File not found")
      # Return the file
    return FileResponse(file_path)

# The recommend_cases_embedding function has been replaced by the one 
# in the semantic search section that uses vector_store

@app.post("/recommend/build-index")
async def build_embedding_index():
    """
    Build or rebuild the vector store index from CSV data
    """
    global vector_store
    
    if not vector_store:
        raise HTTPException(status_code=503, detail="Vector store not initialized")
    
    try:
        # Perform migration from CSV
        csv_file_path = "./data/resources/ner_data.csv"
        if not os.path.exists(csv_file_path):
            raise HTTPException(status_code=404, detail=f"{csv_file_path} not found")
        
        stats = await vector_store.bulk_migrate_from_csv(csv_file_path)
        
        return {
            "message": "Index rebuilt successfully",
            "stats": stats,
            "method": "vector_store (Neon DB)"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error rebuilding index: {str(e)}")

# Example of a protected route using the auth service (optional)
from app.auth_service import get_current_user
from prisma.models import User # Assuming User model is needed

@app.get("/users/me", tags=["User"]) # Example protected route
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

# Chat functionality imports
from groq import AsyncGroq
import PyPDF2
from app.model_config import config

# Chat configuration
prepared_documents = {}
groq_client = AsyncGroq(api_key=config.GROQ_API_KEY)

# Chat utility functions
def extract_pdf_text(pdf_path):
    """Extract text from PDF file."""
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        return " ".join(page.extract_text() for page in reader.pages)

def chunk_and_encode_text(text, chunk_size=None):
    """Chunk the text and encode each chunk into embeddings using HuggingFace API."""
    from app.embedding_service import get_embedding_service
    
    if chunk_size is None:
        chunk_size = config.MAX_CHUNK_SIZE
        
    print(f"Chunking text with chunk_size: {chunk_size}")
    
    # Simple text chunking by characters since we don't have tokenizer
    words = text.split()
    chunks = []
    current_chunk = []
    current_length = 0
    
    for word in words:
        # Approximate token count (rough estimate: 1 word ≈ 1.3 tokens)
        word_token_count = len(word) // 4 + 1
        
        if current_length + word_token_count > chunk_size and current_chunk:
            chunks.append(' '.join(current_chunk))
            current_chunk = [word]
            current_length = word_token_count
        else:
            current_chunk.append(word)
            current_length += word_token_count
    
    if current_chunk:
        chunks.append(' '.join(current_chunk))
    
    print(f"Created {len(chunks)} text chunks")
    
    # Encode all chunks using HuggingFace API
    embedding_service = get_embedding_service()
    embeddings = []
    for chunk_text in chunks:
        embedding = embedding_service.encode(chunk_text)
        embeddings.append(embedding)

    print(f"Created embeddings for {len(chunks)} chunks")
    return chunks, embeddings

def retrieve_context(question, chunks, embeddings, top_n=None):
    """Retrieve the most relevant chunks for the given question using HuggingFace API."""
    from app.embedding_service import get_embedding_service
    
    if top_n is None:
        top_n = config.TOP_N_CHUNKS
        
    print(f"Retrieving context for question with top_n: {top_n}")
    
    # Encode the question using HuggingFace API
    embedding_service = get_embedding_service()
    question_embedding = embedding_service.encode(question)
    
    # Ensure question_embedding is 2D
    if question_embedding.ndim == 1:
        question_embedding = question_embedding.reshape(1, -1)
    
    # Ensure embeddings are 2D
    embeddings_array = np.vstack(embeddings)    
    # Compute cosine similarities - using numpy instead of sklearn
    def cosine_similarity_numpy(a, b):
        """Compute cosine similarity using numpy"""
        dot_product = np.dot(a, b.T)
        norm_a = np.linalg.norm(a, axis=1, keepdims=True)
        norm_b = np.linalg.norm(b, axis=1, keepdims=True)
        return dot_product / (norm_a * norm_b.T)
    
    similarities = cosine_similarity_numpy(question_embedding, embeddings_array).flatten()
    
    # Get top_n most relevant chunks
    top_indices = similarities.argsort()[-top_n:][::-1]
    context = " ".join(chunks[i] for i in top_indices)
    print(f"Retrieved context length: {len(context)}")
    return context

async def generate_chat_response(question, context):
    """Generate a response using Groq API with streaming."""
    messages = [
        {
            "role": "system",
            "content": config.SYSTEM_MESSAGE
        },
        {
            "role": "user",
            "content": f"Context: {context}\nQuestion: {question}"
        }
    ]

    try:
        stream = await groq_client.chat.completions.create(
            messages=messages,
            model=config.LLM_MODEL,
            temperature=config.LLM_TEMPERATURE,
            max_completion_tokens=config.LLM_MAX_TOKENS,
            top_p=config.LLM_TOP_P,
            stream=True,
        )

        async for chunk in stream:
            content = chunk.choices[0].delta.content
            if content:                yield content
    except Exception as e:
        yield f"Error generating response: {str(e)}"

# Chat endpoints
@app.options("/get-ready/{document_id}")
async def options_prepare_document(document_id: str):
    """Handle CORS preflight for prepare document endpoint."""
    return {"message": "OK"}

@app.post("/get-ready/{document_id}")
async def prepare_document(document_id: str):
    """Prepare a document for chat by processing its content."""
    try:
        print(f"GET-READY: Preparing document {document_id}")
        
        # Check if document is already prepared
        if document_id in prepared_documents:
            print(f"GET-READY: Document {document_id} already prepared, skipping processing")
            return {"message": "Case ready", "status": "already_prepared"}
        
        # Load NER data to find the filename for this UUID
        ner_df = pd.read_csv(ner_data_path)
        
        # Check if UUID exists
        target_case = ner_df[ner_df["uuid"] == document_id]
        if target_case.empty:
            print(f"GET-READY: Document ID {document_id} not found in NER data")
            return {"error": "Document ID not found"}
        
        # Get the filename from the mapping
        filename = target_case.iloc[0]["file_name"]
        print(f"GET-READY: Found filename {filename} for UUID {document_id}")
        
        # Try to find in current_context directory first (as .txt file)
        context_file_path = os.path.join(context_directory, f"{filename}.txt")
        if os.path.exists(context_file_path):
            print(f"GET-READY: Loading from context directory: {context_file_path}")
            with open(context_file_path, 'r', encoding='utf-8') as file:
                text_content = file.read()
            print(f"GET-READY: Loaded {len(text_content)} characters from context file")
            chunks, embeddings = chunk_and_encode_text(text_content)
        else:
            # Fallback to PDF directory
            pdf_path = os.path.join(pdf_directory, filename)
            if not os.path.exists(pdf_path):
                print(f"GET-READY: Document file not found: {filename}")
                return {"error": f"Document file not found: {filename}"}
            
            print(f"GET-READY: Loading from PDF directory: {pdf_path}")
            text_content = extract_pdf_text(pdf_path)
            print(f"GET-READY: Extracted {len(text_content)} characters from PDF")
            chunks, embeddings = chunk_and_encode_text(text_content)
        
        # Store prepared data globally for this document
        prepared_documents[document_id] = {
            "chunks": chunks,
            "embeddings": embeddings,
            "text": text_content,
            "filename": filename
        }
        
        print(f"GET-READY: Document {document_id} ({filename}) prepared successfully with {len(chunks)} chunks")
        return {"message": "Case ready"}
    
    except Exception as e:
        print(f"GET-READY: Error preparing document {document_id}: {str(e)}")
        import traceback
        print(f"GET-READY: Traceback: {traceback.format_exc()}")
        return {"error": f"Failed to prepare document: {str(e)}"}

@app.post("/ask")
async def ask_question(request: Request):
    """Handle chat questions with streaming response."""
    data = await request.json()
    question = data.get("question")

    print(f"Received question: {question}")
    print(f"Prepared documents: {list(prepared_documents.keys())}")

    if not question:
        return {"error": "Question is required"}

    # Use the first prepared document if available
    if not prepared_documents:
        return {"error": "No prepared document found. Please prepare a document first."}
    
    # Use the first prepared document (could be improved to handle multiple)
    doc_data = list(prepared_documents.values())[0]
    print(f"Using document with {len(doc_data['chunks'])} chunks")
    
    context = retrieve_context(question, doc_data["chunks"], doc_data["embeddings"])
    print(f"Retrieved context length: {len(context)}")

    # Stream response using Groq
    async def generate_stream():
        try:
            async for chunk in generate_chat_response(question, context):
                yield f"data: {chunk}\n\n"
        except Exception as e:
            print(f"Error in generate_stream: {str(e)}")
            yield f"data: Error generating response: {str(e)}\n\n"

    return StreamingResponse(generate_stream(), media_type="text/plain")

# Existing endpoints continue below
