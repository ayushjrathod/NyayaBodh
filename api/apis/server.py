import os
from threading import Thread
from typing import List

import pandas as pd
from classes import (VALID_PARAMS, SearchRequest_NER, SearchResult_NER,
                     calculate_similarity, load_ner_data)
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fuzzywuzzy import fuzz, process
from pydantic import BaseModel
from PyPDF2 import PdfReader

# Paths
ner_data_path = "./resources/ner_data.csv"
pdf_directory = "./resources/03-09-24"
context_directory = "./current_context"

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins; consider restricting in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = pd.read_csv(ner_data_path)
# chatbot = AIChatbot()

@app.get("/recommend/{uuid}")
async def recommend_cases(uuid: str):
    try:
        # Load CSV()
        df=pd.read_csv('./resources/ner_data.csv')
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
# #ai bot
# @app.post("/ask/")
# async def ask_question(request: Request):
#     data = await request.json()
#     uuid = data.get("uuid")
#     question = data.get("question")

#     # Load the NER data to get the file name
#     ner_data = pd.read_csv(ner_data_path)
#     file_row = ner_data[ner_data["uuid"] == uuid]

#     if file_row.empty:
#         return {"error": "Invalid UUID"}

#     file_name = file_row.iloc[0]["file_name"]
#     text_file_path = os.path.join(context_directory, f"{file_name}.txt")

#     if not os.path.exists(text_file_path):
#         pdf_file_path = os.path.join(pdf_directory, file_name)
#         reader = PdfReader(pdf_file_path)
#         text = "\n".join(page.extract_text() for page in reader.pages)
#         with open(text_file_path, "w", encoding="utf-8") as text_file:
#             text_file.write(text)
#         chatbot.chunked_texts, chatbot.embeddings, chatbot.chunks = chatbot.semantic_chunking(text)

#     return StreamingResponse(chatbot.generate_response(question), media_type="text/plain")



# # entity based search
# @app.post("/search/entity", response_model=List[SearchResult])
# async def search_entity(request: SearchRequest):
#     """
#     Search for entities in the specified column of the CSV using fuzzy matching.
#     """
#     # Validate the param
#     param = request.param.lower()
#     if param not in VALID_PARAMS:
#         raise HTTPException(status_code=400, detail=f"Invalid param. Valid params: {', '.join(VALID_PARAMS.keys())}")

#     # Get the corresponding column from the DataFrame
#     column_name = VALID_PARAMS[param]
#     if column_name not in df.columns:
#         raise HTTPException(status_code=500, detail=f"Column '{column_name}' not found in the CSV.")

#     # Extract data for fuzzy matching
#     column_data = df[column_name].fillna("").tolist()

#     # Perform fuzzy matching
#     results = process.extractBests(request.query, column_data, scorer=fuzz.partial_ratio, limit=10)

#     # Create the response
#     response = []
#     for match, score in results:
#         if score >= 80:  # Optional: Set a score threshold
#             # Find the index of the match in the original dataframe
#             index = df[column_name].eq(match).idxmax()
#             response.append(SearchResult(
#                 uuid=df.loc[index, "uuid"],
#                 case_name=df.loc[index, "file_name"],
#                 entities=df.loc[index, column_name]  # Send the full cell content
#             ))

#     if not response:
#         raise HTTPException(status_code=404, detail="No matching results found.")
    
#     return response

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
                        petitioner=df.loc[index, "PETITIONER"],
                        respondent=df.loc[index, "RESPONDENT"],
                        entities=df.loc[index, column_name],
                        summary=df.loc[index, "summary"]
                    ))
    
    if not response:
        raise HTTPException(status_code=404, detail="No matching results found.")
    
    return response

from fastapi import FastAPI, HTTPException
import pandas as pd
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from fastapi.responses import FileResponse
from fuzzywuzzy import fuzz
import os
from fastapi.middleware.cors import CORSMiddleware
# from models import SearchRequestSEM, ActSearchRequestSEM, SearchResponseSEM
# from .utils import search, fuzzy_search
from pydantic import BaseModel
from pydantic import BaseModel
from typing import List, Optional

class SearchRequestSEM(BaseModel):
    query: str
    param: Optional[str] = ""  # Add this field with a default empty string

class ActSearchRequestSEM(BaseModel):
    act_name: str

class SearchResponseSEM(BaseModel):
    SemanticResultData: List[dict]

# class SearchResult(BaseModel):
#     uuid: str
#     case_name: str
#     entities: str
#     case_number: str | None
#     court: str | None
#     date: str | None
#     statute: str | None
# Initialize FastAPI app
# app = FastAPI()

# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Allow all origins
#     allow_credentials=True,
#     allow_methods=["*"],  # Allow all HTTP methods
#     allow_headers=["*"],  # Allow all headers
# )

# Load the CSV file into a DataFrame
csv_file_path = './resources/ner_data.csv'  # Updated to use ner_data.csv
df = pd.read_csv(csv_file_path)

# Load the sentence transformer model
model = SentenceTransformer("Alibaba-NLP/gte-base-en-v1.5", trust_remote_code=True)

# Initialize Faiss index for summarys
dim = 768  # Adjusted dimension according to the new model
summary_index = faiss.IndexFlatL2(dim)

# List to store metadata for summarys space
summary_serial_nos = []
summary_texts = []

# Embed and store data
for index, row in df.iterrows():
    uuid = row['uuid']
    summary_text = row['summary']

    # Skip if summary_text is NaN or not a string
    if pd.isnull(summary_text) or not isinstance(summary_text, str):
        continue

    # Embedding each summary separately
    summary_embedding = model.encode([summary_text])
    
    # Ensure embedding is a 2D array
    summary_embedding = np.array(summary_embedding, dtype='float32')
    
    # Add embedding to the Faiss index
    summary_index.add(summary_embedding)
    
    # Store the corresponding serial number and summary text
    summary_serial_nos.append(uuid)
    summary_texts.append(summary_text)

# Convert serial number list to numpy array for fast indexing
summary_serial_nos = np.array(summary_serial_nos)

# Define the request models
class SearchRequestSEM(BaseModel):
    query: str

class ActSearchRequestSEM(BaseModel):
    act_name: str

# Define the response model
class SearchResponseSEM(BaseModel):
    serial_no: int
    metadata: dict
    id: int
    description: str

# Define fuzzy search function
def fuzzy_search(text, search_term, threshold=80):
    return fuzz.partial_ratio(text.lower(), search_term.lower()) >= threshold
def search(query, k=10):
    """
    Perform semantic search using FAISS for the provided query.
    """
    if not query.startswith("space:summarys"):
        raise ValueError("Query must start with 'space:summarys'")
    
    query_text = query[len("space:summarys"):].strip()
    query_embedding = model.encode([query_text])

    # Ensure query embedding is a 2D array
    query_embedding = np.array(query_embedding, dtype='float32')

    if summary_index.ntotal == 0:
        raise ValueError("The Faiss index is empty. No data to search.")

    # Perform search
    distances, indices = summary_index.search(query_embedding, k)

    # Fetch results
    results_uuids = summary_serial_nos[indices[0]].tolist()
    results_summaries = [summary_texts[i] for i in indices[0]]
    results_scores = distances[0].tolist()

    return results_uuids, results_summaries, results_scores

@app.post("/search/semantic")
async def search_endpoint(request: SearchRequestSEM):
    query = request.query
    query="space:summarys "+query
    print(f"Query: {query}")

    try:
        uuids, summaries, scores = search(query)

        semantic_result_data = []
        for uuid, summary, score in zip(uuids, summaries, scores):
            # Fetch the corresponding row in the DataFrame
            row = df[df['uuid'] == uuid]
            
            if row.empty:
                print(f"Warning: No metadata found for UUID {uuid}")
                metadata = {}
            else:
                row = row.iloc[0]  # Take the first match
                metadata = {col: row[col] for col in df.columns}

            # Replace invalid float values
            valid_score = 0.0 if not np.isfinite(score) else score

            # Ensure metadata values are JSON-compliant
            clean_metadata = {k: (0.0 if isinstance(v, float) and not np.isfinite(v) else v)
                              for k, v in metadata.items()}

            result = {
                "uuid": uuid,
                "summary": summary,
                "score": valid_score,
                "metadata": clean_metadata,
            }
            semantic_result_data.append(result)

        return {"SemanticResultData": semantic_result_data}

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# @app.post("/search/semantic")
# async def search_endpoint(request: SearchRequestSEM):
#     query = request.query
#     print(query)
#     uuids, summarys, scores = search(query)

#     semantic_result_data = []
#     for uuid, summary, score in zip(uuids, summarys, scores):
#         # Find the corresponding row in the DataFrame
#         row = df[df['uuid'] == uuid].iloc[0]
        
#         result = {
#             "uuid": uuid,
#             "summary": summary,
#             "metadata": row.get('metadata', ''),  # Use get() to handle missing 'metadata'
#             "filename": row.get('Filename', '')  # Optional: include filename if needed
#         }
#         semantic_result_data.append(result)
    
#     return {"SemanticResultData": semantic_result_data}

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

# if _name_ == "_main_":
#     import uvicorn
#     uvicorn.run(app, host="localhost", port=8000)