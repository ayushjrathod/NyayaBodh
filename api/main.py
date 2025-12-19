from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel
import os
import asyncio

from app.routers.auth import auth_router, admin_router
from app.routers.chat import chat_router
from app.routers.doc_gen import doc_gen_router
from api.app.utils.database import prisma, logger as db_logger
from api.app.utils.config import ModelConfig as config
from app.services.vector_store_service import initialize_vector_store
from contextlib import asynccontextmanager

from api.app.classes.global_classes import (SearchRequest_NER, SearchResult_NER)
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

load_dotenv()
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MODEL_NAME = config.EMBEDDING_MODEL

vector_store = None

@asynccontextmanager
async def lifespan():
    """Manage database connections and load initial data."""
    global vector_store
    
    # Connect to Prisma
    retries = 5
    retry_delay = 1
    for attempt in range(retries):
        try:
            db_logger.info(f"Connecting to database (attempt {attempt + 1}/{retries})")
            await prisma.connect()
            db_logger.info("Database connection successful")
            break
        except Exception as e:
            if attempt == retries - 1:
                db_logger.error(f"Failed to connect after {retries} attempts: {e}")
            else:
                db_logger.warning(f"Connection failed: {e}, retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
    
    # Initialize vector store
    try:
        vector_store = await initialize_vector_store(prisma)
        db_logger.info("Vector store initialized successfully")
    except Exception as e:
        db_logger.error(f"Failed to initialize vector store: {e}")
        vector_store = None
    
    yield
    
    # Disconnect from Prisma
    if prisma.is_connected():
        await prisma.disconnect()
        db_logger.info("Database disconnected")

# Initialize FastAPI
app = FastAPI(
    title="NyayBodh API",
    description="Main API for NyayBodh including Authentication and other services",
    debug=True,
    lifespan=lifespan
)

# Include the authentication routers
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(chat_router)
app.include_router(doc_gen_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/recommend/{uuid}")
async def recommend_cases(uuid: str):
    """
    Recommend cases based on vector similarity using the database.
    Replaces the old pandas/fuzzy implementation.
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
        
        # Helper to safely get value or None (mimicking old behavior)
        def convert_row(doc_dict):
            metadata = doc_dict.get('metadata', {}) or {}
            # Flatten dictionary for legacy compatibility
            legacy_dict = {
                "uuid": doc_dict.get('uuid'),
                "PETITIONER": doc_dict.get('petitioner'),
                "RESPONDENT": doc_dict.get('respondent'),
                "summary": doc_dict.get('summary'),
                "Filename": doc_dict.get('filename'),
            }
            # Merge metadata
            if isinstance(metadata, dict):
                legacy_dict.update(metadata)
            return {k: (None if v is None else v) for k, v in legacy_dict.items()}

        response = {
            "target_case": convert_row(case_data),
            "recommended_cases": [convert_row(case) for case in similar_cases]
        }
        
        return JSONResponse(content=response)
    
    except HTTPException as http_e:
        raise http_e
    except Exception as e:
        logger.error(f"Error in recommend_cases: {e}")
        return JSONResponse(
            status_code=500, 
            content={"error": str(e)}
        )

# Helper for handling None values (legacy support)
def safe_get_value(val, default_for_none=""):
    if val is None:
        return default_for_none
    return str(val)

@app.post("/search/entity", response_model=List[SearchResult_NER])
async def search_entity(request: SearchRequest_NER):
    """
    Search for cases using semantic search on the database.
    Replaces the old fuzzy search over CSV columns.
    """
    global vector_store
    
    if not vector_store:
        logger.warning("Vector store not initialized; returning empty entity result set.")
        return []
    
    try:
        # Perform similarity search using the query
        results = await vector_store.similarity_search(request.query, k=10, min_similarity=0.1)
        
        response = []
        for result in results:
            response.append(SearchResult_NER(
                uuid=result['uuid'],
                petitioner=safe_get_value(result.get('petitioner')),
                respondent=safe_get_value(result.get('respondent')),
                entities=safe_get_value(result.get('summary')[:200] + "..."), # Using summary preview as 'entities'
                summary=safe_get_value(result.get('summary'))
            ))
            
        return response
        
    except Exception as e:
        logger.error("Entity search failed for query '%s': %s", request.query, str(e))
        return []

# Additional imports for semantic search
from typing import List, Optional

class SearchRequestSEM(BaseModel):
    query: str
    param: Optional[str] = ""

class ActSearchRequestSEM(BaseModel):
    act_name: str

class SearchResponseSEM(BaseModel):
    SemanticResultData: List[dict]

# Updated semantic search using vector store
@app.post("/search/semantic")
async def search_endpoint(request: SearchRequestSEM):
    global vector_store
    
    if not vector_store:
        logger.warning("Vector store not initialized; returning empty semantic result set.")
        return {"SemanticResultData": [{
            "uuid": "unavailable",
            "title": "Search temporarily unavailable",
            "summary": "Try again in a moment.",
            "score": 0.0,
            "metadata": {}
        }]}
    
    query = request.query
    logger.info(f"Semantic Search Query: {query}")

    try:
        # Use vector store for similarity search
        results = await vector_store.similarity_search(query, k=10, min_similarity=0.1)
        
        semantic_result_data = []
        for result in results:
            petitioner = result.get('petitioner', '')
            respondent = result.get('respondent', '')
            filename = result.get('filename', '')
            
            if petitioner and respondent:
                title = f"{petitioner} v. {respondent}"
            elif filename:
                title = filename.replace('.pdf', '').replace('.txt', '')
            else:
                title = "Legal Case Document"
            
            result_data = {
                "uuid": result['uuid'],
                "title": title,
                "summary": result['summary'],
                "score": float(result['similarity_score']),
                "metadata": result['metadata'] or {},
            }
            semantic_result_data.append(result_data)

        if not semantic_result_data:
            return {"SemanticResultData": [{
                "uuid": "no-match",
                "title": "No close match found",
                "summary": "Try a broader or different query.",
                "score": 0.0,
                "metadata": {}
            }]}

        return {"SemanticResultData": semantic_result_data}

    except Exception as e:
        logger.error("Semantic search failed for query '%s': %s", query, str(e))
        return {"SemanticResultData": [{
            "uuid": "error",
            "title": "Search error",
            "summary": "We hit an issue running the search. Please retry.",
            "score": 0.0,
            "metadata": {}
        }]}

@app.get("/recommend/embedding/{uuid}")
async def recommend_cases_embedding(uuid: str):
    """
    Embedding-based case recommendation using vector store (Alias for /recommend/{uuid} essentially)
    """
    return await recommend_cases(uuid)

@app.post("/search-acts")
async def search_acts(request: ActSearchRequestSEM):
    """
    Search for Acts using semantic search on the database.
    """
    global vector_store
    if not vector_store:
         raise HTTPException(status_code=503, detail="Vector store not initialized")

    act_name = request.act_name.strip()
    
    try:
        # Use similarity search to find documents relevant to the Act name
        results = await vector_store.similarity_search(act_name, k=10, min_similarity=0.1)
        
        formatted_results = []
        for result in results:
            metadata = result.get('metadata') or {}
            # Try to get "List of Acts" from metadata if available, else usage summary
            acts = metadata.get("List of Acts") or metadata.get("acts") or ""
            
            formatted_results.append({
                 "SemanticResultData": [
                    {
                        "uuid": result['uuid'],
                        "description": result['summary'],
                        "metadata": metadata,
                        "acts": acts 
                    }
                 ]
            })
            
        if not formatted_results:
             raise HTTPException(status_code=404, detail="No matching acts found")
             
        return {"results": formatted_results}

    except HTTPException:
        raise
    except Exception as e:
         logger.error(f"Error in search-acts: {e}")
         raise HTTPException(status_code=500, detail=f"Error searching acts: {str(e)}")


@app.get("/get-file/{uuid}")
async def get_file(uuid: str):
    """
    Serve PDF file for a given UUID using database lookup for filename.
    """
    # Verify DB connection
    if not prisma.is_connected():
         raise HTTPException(status_code=503, detail="Database not connected")

    try:
        # Lookup document in DB
        doc = await prisma.document.find_unique(where={'uuid': uuid})
        if not doc:
             raise HTTPException(status_code=404, detail="UUID not found")
        
        filename = doc.filename
        if not filename:
             raise HTTPException(status_code=404, detail="Filename not available for this UUID")
        
        filename = filename.strip()
        file_path = os.path.join(pdf_folder, filename)

        if not os.path.isfile(file_path):
            logger.warning(f"File found in DB but missing on disk: {file_path}")
            raise HTTPException(status_code=404, detail="File not found on server")

        return FileResponse(file_path, media_type="application/pdf", filename=filename)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving file {uuid}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

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

# Example of a protected route using the auth service
from app.services.auth_service import get_current_user
from prisma.models import User 

@app.get("/users/me", tags=["User"]) 
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
