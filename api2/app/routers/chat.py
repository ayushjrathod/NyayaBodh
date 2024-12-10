import os
from threading import Thread

import numpy as np
import pandas as pd
import PyPDF2  # For PDF text extraction
import torch
from fastapi import APIRouter, FastAPI, Request
from fastapi.responses import StreamingResponse
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModel, AutoTokenizer, TextIteratorStreamer
from unsloth import FastLanguageModel

router = APIRouter()

# Load CSV
csv_file = "ner_data.csv"

pdf_folder = "03-09-24"
ner_data = pd.read_csv(csv_file).set_index("uuid").to_dict()["file_name"]

# Load Models
embedding_model_name = "Alibaba-NLP/gte-base-en-v1.5"
tokenizer = AutoTokenizer.from_pretrained(embedding_model_name, trust_remote_code=True)
embedding_model = AutoModel.from_pretrained(embedding_model_name, trust_remote_code=True)
# Load LLaMA Model
llama_model_name = "unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit"
llama_model, llama_tokenizer = FastLanguageModel.from_pretrained(
    model_name=llama_model_name, load_in_4bit=True
)

# Prepare the model for inference
llama_model = FastLanguageModel.for_inference(llama_model)


# PDF Text Extraction
def extract_pdf_text(pdf_path):
    with open(pdf_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        return " ".join(page.extract_text() for page in reader.pages)

# Text Chunking and Encoding
def chunk_and_encode_text(text, chunk_size=100):
    """Chunk the text and encode each chunk into embeddings."""
    tokens = tokenizer.tokenize(text)
    chunks = [tokens[i:i + chunk_size] for i in range(0, len(tokens), chunk_size)]
    chunk_texts = [tokenizer.convert_tokens_to_string(chunk) for chunk in chunks]

    embeddings = []
    for chunk_text in chunk_texts:
        inputs = tokenizer(chunk_text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():  # Ensure gradients are not computed
            outputs = embedding_model(**inputs)
        embedding = outputs.last_hidden_state.mean(dim=1).detach().numpy()
        embeddings.append(embedding)

    return chunk_texts, embeddings


def retrieve_context(question, chunks, embeddings, top_n=5):
    """Retrieve the most relevant chunks for the given question."""
    # Encode the question
    inputs = tokenizer(question, return_tensors="pt", truncation=True, padding=True)
    with torch.no_grad():
        outputs = embedding_model(**inputs)
    
    # Ensure question_embedding is 2D
    question_embedding = outputs.last_hidden_state.mean(dim=1).detach().numpy()
    question_embedding = question_embedding.reshape(1, -1)  # Shape: (1, embedding_dim)

    # Ensure embeddings are 2D
    embeddings = np.vstack(embeddings)  # Combine all chunk embeddings into a 2D array

    # Compute cosine similarities
    similarities = cosine_similarity(question_embedding, embeddings).flatten()

    # Retrieve top_n most relevant chunks
    top_indices = similarities.argsort()[-top_n:][::-1]
    return " ".join(chunks[i] for i in top_indices)
def generate_response(question, context):
    input_template = """
    Context: {context}
    Question: {question}
    Answer:
    """
    input_text = input_template.format(context=context, question=question)

    inputs = llama_tokenizer(input_text, return_tensors="pt")
    streamer = TextIteratorStreamer(llama_tokenizer)

    # Use a thread to generate the response
    def run_generation():
        llama_model.generate(**inputs, streamer=streamer, max_new_tokens=256)

    thread = Thread(target=run_generation)
    thread.start()

    # Stream only the model's response
    skip_initial_text = True  # Skip everything before "Answer:"
    for text in streamer:
        if skip_initial_text:
            # Wait until "Answer:" is encountered
            if "Answer:" in text:
                skip_initial_text = False
                # Only send text after "Answer:"
                text = text.split("Answer:", 1)[-1].lstrip()
                yield text
        else:
            yield text

    thread.join()




# API Endpoint
@router.post("/ask/")
async def ask_question(request: Request):
    data = await request.json()
    uuid = data.get("uuid")
    question = data.get("question")

    # Find the corresponding PDF
    pdf_name = ner_data.get(uuid)
    if not pdf_name:
        return {"error": "UUID not found."}

    pdf_path = os.path.join(pdf_folder, pdf_name)
    if not os.path.exists(pdf_path):
        return {"error": "PDF file not found."}

    # Extract text and retrieve context
    pdf_text = extract_pdf_text(pdf_path)
    chunks, embeddings = chunk_and_encode_text(pdf_text)
    context = retrieve_context(question, chunks, embeddings)

    # Stream response
    return StreamingResponse(generate_response(question, context), media_type="text/plain")
