import os
from threading import Thread
from typing import List

import pandas as pd
from classes import (VALID_PARAMS, AIChatbot, SearchRequest, SearchResult,
                     calculate_similarity, load_ner_data)
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fuzzywuzzy import fuzz, process
from pydantic import BaseModel
from PyPDF2 import PdfReader

# Paths
ner_data_path = "apis/resources/ner_data.csv"
pdf_directory = "apis/resources/03-09-24"
context_directory = "current_context"

# Initialize FastAPI
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df = pd.read_csv(ner_data_path)
chatbot = AIChatbot()

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
