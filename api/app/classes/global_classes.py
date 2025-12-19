import numpy as np
import os
from threading import Thread
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity   
from sklearn.metrics import silhouette_score
from pydantic import BaseModel
from typing import List

# Configuration
embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
max_chunk_size = 100
max_seq_length = 2048
dtype = None  # None for auto detection. Float16 for Tesla T4, V100, Bfloat16 for Ampere+
load_in_4bit = True

# Define valid parameters and corresponding columns
VALID_PARAMS = {
    "lawyer": "LAWYER",
    "judge": "JUDGE",
    "gpe": "GPE",
    "court": "COURT",
    "org": "ORG",
    "petitioner": "PETITIONER",
    "respondent": "RESPONDENT",
    "statute": "STATUTE",
}

class SearchRequest_NER(BaseModel):
    query: str

class SearchResult_NER(BaseModel):
    uuid: str
    petitioner: str
    entities: str
    respondent : str
    summary : str

def calculate_similarity(row1, row2, columns):
    """
    Calculate the overall similarity score between two rows
    based on the specified columns.
    """
    # Stub retained for compatibility if needed.
    pass
