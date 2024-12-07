from fastapi import FastAPI, HTTPException
import pandas as pd
import faiss
from transformers import AutoTokenizer, AutoModel
import torch
import os

app = FastAPI()

# File paths
CSV_FILE = "summaries.csv"
FAISS_INDEX_FILE = "faiss_index.db"

# Embedding and model configurations
EMBEDDING_DIM = 768
MODEL_NAME = "Alibaba-NLP/gte-base-en-v1.5"

# Initialize tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME)

# Initialize FAISS index and metadata storage
index = faiss.IndexFlatL2(EMBEDDING_DIM)
metadata = []

@app.on_event("startup")
def load_data_and_index():
    global metadata, index

    # Load the CSV file
    if not os.path.exists(CSV_FILE):
        raise FileNotFoundError(f"{CSV_FILE} not found. Ensure the file exists in the correct location.")
    data = pd.read_csv(CSV_FILE)

    # Check if FAISS index exists
    if os.path.exists(FAISS_INDEX_FILE):
        # Load the existing FAISS index
        index = faiss.read_index(FAISS_INDEX_FILE)
        print("FAISS index loaded from disk.")
    else:
        print("No FAISS index found. Creating a new one.")
        embeddings = []

        for _, row in data.iterrows():
            # Ensure all required fields are valid
            text = row.get("summary")
            petitioner = row.get("PETITIONER")
            respondent = row.get("RESPONDENT")
            uuid = row.get("uuid")

            if not all(isinstance(val, str) for val in [text, petitioner, respondent, uuid]):
                continue  # Skip rows with invalid or missing data
            
            # Generate embeddings for the summary
            inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
            with torch.no_grad():
                embedding = model(**inputs).last_hidden_state.mean(dim=1).numpy()

            embeddings.append(embedding)
            metadata.append({
                "uuid": uuid,
                "case_name": f"{petitioner} vs {respondent}",
                "summary": text
            })

        # Convert embeddings to NumPy array and add to FAISS index
        embeddings_np = torch.cat([torch.tensor(e) for e in embeddings]).numpy()
        index.add(embeddings_np)

        # Save the FAISS index to disk
        faiss.write_index(index, FAISS_INDEX_FILE)
        print("FAISS index saved to disk.")

@app.get("/recommend/{uuid}")
def recommend_cases(uuid: str):
    # Find the requested case in metadata
    case_data = next((case for case in metadata if case["uuid"] == uuid), None)
    if not case_data:
        raise HTTPException(status_code=404, detail="UUID not found")

    # Get the embedding for the input case
    text = case_data["summary"]
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        query_embedding = model(**inputs).last_hidden_state.mean(dim=1).numpy()

    # Search for the top 5 similar cases
    distances, indices = index.search(query_embedding, k=5)
    similar_cases = []

    for i in indices[0]:
        # Retrieve case metadata for each similar case
        case = metadata[i]
        similar_cases.append({
            "case_name": case["case_name"],
            "summary": case["summary"]
        })

    return similar_cases

