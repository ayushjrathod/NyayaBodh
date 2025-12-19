import os
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from groq import AsyncGroq
from dotenv import load_dotenv
from ..utils.config import config
from ..services.embedding_service import get_embedding_service
from ..utils.database import prisma, db_logger
import logging
import PyPDF2

#TODO: Improve whole logic accross the file

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

chat_router = APIRouter(prefix="/chat")

pdf_folder = "./data/resources/03-09-24"

# Initialize HuggingFace embedding service
embedding_service = get_embedding_service()

# Initialize Groq client
groq_client = AsyncGroq(api_key=config.GROQ_API_KEY)

# PDF Text Extraction
def extract_pdf_text(pdf_path):
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        return " ".join(page.extract_text() for page in reader.pages)

# Text Chunking and Encoding using HuggingFace API
def chunk_and_encode_text(text, chunk_size=None):
    """Chunk the text and encode each chunk into embeddings using HuggingFace API."""
    if chunk_size is None:
        chunk_size = config.MAX_CHUNK_SIZE
        
    # TODO: Improve chunking strategy (currently simple word-based)
    # Simple text chunking by words since we don't have tokenizer
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

    # Encode all chunks using HuggingFace API
    embeddings = []
    for chunk_text in chunks:
        embedding = embedding_service.encode(chunk_text)
        embeddings.append(embedding)

    return chunks, embeddings


def retrieve_context(question, chunks, embeddings, top_n=None):
    """Retrieve the most relevant chunks for the given question using HuggingFace API."""
    if top_n is None:
        top_n = config.TOP_N_CHUNKS
    
    # Encode the question using HuggingFace API
    question_embedding = embedding_service.encode(question)
    
    # Ensure question_embedding is 2D
    if question_embedding.ndim == 1:
        question_embedding = question_embedding.reshape(1, -1)

    # Ensure embeddings are 2D
    embeddings_array = np.vstack(embeddings)  # Combine all chunk embeddings into a 2D array

    # Compute cosine similarities
    similarities = cosine_similarity(question_embedding, embeddings_array).flatten()

    # Retrieve top_n most relevant chunks
    top_indices = similarities.argsort()[-top_n:][::-1]
    return " ".join(chunks[i] for i in top_indices)

async def generate_response(question, context):
    """Generate a response using Groq API with streaming."""
    
    SYSTEM_MESSAGE = """
                        You are a helpful assistant that responds to the user based on the context provided. 
                        If the answer does not lie in the context, you will respond with that is not my area of expertise, 
                        I am a chatbot designed for Vidi-Lekhak, a platform to help users know and create legal documents. 
                        You will refer to Vidhi-Lekhak as "our" platform. You are the assistant for the vidhilekhak platform. 
                        If any document is mentioned by the user you will also give the steps to generate it.
                    """

    messages = [
        {
            "role": "system",
            "content": SYSTEM_MESSAGE
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
            if content:
                yield content
    except Exception as e:
        yield f"Error generating response: {str(e)}"


# Document preparation global variables
prepared_documents = {}

@chat_router.post("/get-ready/{document_id}")
async def prepare_document(document_id: str):
    """Prepare a document for chat by processing its content."""
    try:
        # Find the corresponding PDF from DB
        doc = await prisma.document.find_unique(where={'uuid': document_id})
        
        if not doc or not doc.filename:
            return {"error": "Document ID not found or filename missing."}

        pdf_name = doc.filename.strip()
        pdf_path = os.path.join(pdf_folder, pdf_name)
        
        if not os.path.exists(pdf_path):
            logger.error(f"PDF file missing on disk: {pdf_path}")
            return {"error": "PDF file not found on server."}

        # Extract text and prepare for chat
        pdf_text = extract_pdf_text(pdf_path)
        chunks, embeddings = chunk_and_encode_text(pdf_text)
        
        # Store prepared data globally for this document
        prepared_documents[document_id] = {
            "chunks": chunks,
            "embeddings": embeddings,
            "text": pdf_text
        }
        
        return {"message": "Case ready"}
    
    except Exception as e:
        logger.error(f"Error checking document in DB: {e}")
        return {"error": f"Failed to prepare document: {str(e)}"}

# API Endpoint
@chat_router.post("/ask")
async def ask_question(request: Request):
    data = await request.json()
    question = data.get("question")

    # For now, we'll use the first prepared document if available
    # In a full implementation, you'd get the document_id from the request
    if not prepared_documents:
        # Fallback: try to use UUID if provided
        uuid = data.get("uuid")
        if uuid:
            try: 
                 # Find the corresponding PDF
                doc = await prisma.document.find_unique(where={'uuid': uuid})
                
                if not doc or not doc.filename:
                    return {"error": "UUID not found or filename missing."}

                pdf_name = doc.filename.strip()
                pdf_path = os.path.join(pdf_folder, pdf_name)
                
                if not os.path.exists(pdf_path):
                    return {"error": "PDF file not found."}

                # Extract text and retrieve context
                pdf_text = extract_pdf_text(pdf_path)
                chunks, embeddings = chunk_and_encode_text(pdf_text)
                context = retrieve_context(question, chunks, embeddings)
            except Exception as e:
                 logger.error(f"Error in ask_question fallback: {e}")
                 return {"error": f"Error: {e}"}
        else:
            return {"error": "No prepared document found and no UUID provided."}
    else:
        # Use the first prepared document (could be improved to handle multiple)
        # TODO: Handle multi-user concurrency better than a global dict
        doc_data = list(prepared_documents.values())[0]
        context = retrieve_context(question, doc_data["chunks"], doc_data["embeddings"])

    # Stream response using Groq
    async def generate_stream():
        async for chunk in generate_response(question, context):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(generate_stream(), media_type="text/plain")
