import os
from typing import List, Optional

import faiss
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fuzzywuzzy import fuzz
from models import ActSearchRequest, SearchRequest, SearchResponse
# from .utils import search, fuzzy_search
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


class SearchRequest(BaseModel):
    query: str
    param: Optional[str] = ""  # Add this field with a default empty string

class ActSearchRequest(BaseModel):
    act_name: str

class SearchResponse(BaseModel):
    SemanticResultData: List[dict]

class SearchResult(BaseModel):
    uuid: str
    case_name: str
    entities: str
    case_number: str | None
    court: str | None
    date: str | None
    statute: str | None
# Initialize FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Load the CSV file into a DataFrame
csv_file_path = './sections.csv'  # Update with your CSV file path
df = pd.read_csv(csv_file_path)

# Load the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize Faiss index for issues
dim = 384  # Adjust this dimension according to your model
issue_index = faiss.IndexFlatL2(dim)

# List to store metadata for issues space
issue_serial_nos = []
issue_texts = []

# Embed and store data
for index, row in df.iterrows():
    serial_no = row['Serial No']
    
    # Embedding each issue separately
    issue_text = row['Issue for Consideration']
    issue_embedding = model.encode([issue_text])
    
    # Ensure embedding is a 2D array
    issue_embedding = np.array(issue_embedding, dtype='float32')
    
    # Add embedding to the Faiss index
    issue_index.add(issue_embedding)
    
    # Store the corresponding serial number and issue text
    issue_serial_nos.append(serial_no)
    issue_texts.append(issue_text)

# Convert serial number list to numpy array for fast indexing
issue_serial_nos = np.array(issue_serial_nos)

# Define the request models
class SearchRequest(BaseModel):
    query: str

class ActSearchRequest(BaseModel):
    act_name: str

# Define the response model
class SearchResponse(BaseModel):
    serial_no: int
    metadata: str
    id: int
    description: str

# Define fuzzy search function
def fuzzy_search(text, search_term, threshold=80):
    return fuzz.partial_ratio(text.lower(), search_term.lower()) >= threshold

# Define the search function for issues space
def search(query, k=10):
    if query.startswith(""):
        query_text = query[len("space:issues"):].strip()
        query_embedding = model.encode([query_text])
        
        # Ensure query embedding is a 2D array
        query_embedding = np.array(query_embedding, dtype='float32')
        
        # Search the Faiss index
        distances, indices = issue_index.search(query_embedding, k)
        
        # Retrieve the top k results' serial numbers, corresponding issues, and distances
        results_serial_nos = issue_serial_nos[indices[0]].tolist()  # Convert to list
        results_issues = [issue_texts[i] for i in indices[0]]
        results_scores = distances[0].tolist()  # Convert to list
    else:
        raise ValueError("Query must start with 'space:issues'")
    
    return results_serial_nos, results_issues, results_scores

@app.post("/search/semantic")
async def search_endpoint(request: SearchRequest):
    query = request.query
    print(query)
    serial_nos, issues, scores = search(query)

    semantic_result_data = []
    for serial_no, issue, score in zip(serial_nos, issues, scores):
        # Find the corresponding row in the DataFrame
        row = df[df['Serial No'] == serial_no].iloc[0]
        
        result = {
            "id": int(serial_no),
            "description": issue,
            "metadata": row['metadata'],  # Ensure metadata is passed through
            "filename": row.get('Filename', '')  # Optional: include filename if needed
        }
        semantic_result_data.append(result)
    
    return {"SemanticResultData": semantic_result_data}

@app.post("/search-acts")
async def search_acts(request: ActSearchRequest):
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
                {"id": row.get("Serial No"),
                "description": row.get("Issue for Consideration"),
                "metadata": row.get("metadata"),
                "acts": row.get("List of Acts")}
                ]
            }
            results.append(result)
    
    if not results:
        raise HTTPException(status_code=404, detail="No matching acts found")
    
    return {"results": results}

pdf_folder = './03-09-24'

@app.get("/get-file/{serial_no}")
async def get_file(serial_no: int):
    # Check if the serial number is in the DataFrame
    row = df[df['Serial No'] == serial_no]
    if row.empty:
        raise HTTPException(status_code=404, detail="Serial number not found")
    
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
import os
from threading import Thread
from typing import List

import pandas as pd
from classes import (VALID_PARAMS, SearchRequest, SearchResult,
                     calculate_similarity, load_ner_data)
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fuzzywuzzy import fuzz, process
from pydantic import BaseModel
from PyPDF2 import PdfReader

# Paths
ner_data_path = "ner_data.csv"
pdf_directory = "03-09-24"
context_directory = "current_context"

# Initialize FastAPI
# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

df = pd.read_csv(ner_data_path)
@app.get("/recommend/{uuid}")
async def recommend_cases(uuid: str):
    try:
        # Load CSV
        # df = load_ner_data()
        
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
#ai bot
@app.post("/ask/")
async def ask_question(request: Request):
    data = await request.json()
    uuid = data.get("uuid")
    question = data.get("question")

    # Load the NER data to get the file name
    ner_data = pd.read_csv(ner_data_path)
    file_row = ner_data[ner_data["uuid"] == uuid]

    if file_row.empty:
        return {"error": "Invalid UUID"}

    file_name = file_row.iloc[0]["file_name"]
    text_file_path = os.path.join(context_directory, f"{file_name}.txt")

    if not os.path.exists(text_file_path):
        pdf_file_path = os.path.join(pdf_directory, file_name)
        reader = PdfReader(pdf_file_path)
        text = "\n".join(page.extract_text() for page in reader.pages)
        with open(text_file_path, "w", encoding="utf-8") as text_file:
            text_file.write(text)
        chatbot.chunked_texts, chatbot.embeddings, chatbot.chunks = chatbot.semantic_chunking(text)

    return StreamingResponse(chatbot.generate_response(question), media_type="text/plain")



# entity based search
@app.post("/search/entity", response_model=List[SearchResult])
async def search_entity(request: SearchRequest):
    """
    Search for entities in the specified column of the CSV using fuzzy matching.
    """
    # Validate the param
    param = request.param.lower()
    if param not in VALID_PARAMS:
        raise HTTPException(status_code=400, detail=f"Invalid param. Valid params: {', '.join(VALID_PARAMS.keys())}")

    # Get the corresponding column from the DataFrame
    column_name = VALID_PARAMS[param]
    if column_name not in df.columns:
        raise HTTPException(status_code=500, detail=f"Column '{column_name}' not found in the CSV.")

    # Extract data for fuzzy matching
    column_data = df[column_name].fillna("").tolist()

    # Perform fuzzy matching
    results = process.extractBests(request.query, column_data, scorer=fuzz.partial_ratio, limit=10)

    # Create the response
    response = []
    for match, score in results:
        if score >= 80:  # Optional: Set a score threshold
            # Find the index of the match in the original dataframe
            index = df[column_name].eq(match).idxmax()
            response.append(SearchResult(
                uuid=df.loc[index, "uuid"],
                case_name=df.loc[index, "file_name"],
                entities=df.loc[index, column_name]  # Send the full cell content
            ))

    if not response:
        raise HTTPException(status_code=404, detail="No matching results found.")
    
    return response
