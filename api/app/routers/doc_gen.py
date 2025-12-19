from fastapi import Request
from fastapi.responses import StreamingResponse
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import silhouette_score
from groq import AsyncGroq
import os
from dotenv import load_dotenv
from app.services.embedding_service import get_embedding_service
from fastapi import APIRouter, Request
from api.app.utils.config import config

# TODO: Change logic accross file 

load_dotenv()

doc_gen_router = APIRouter(prefix="/doc-gen")

class AIChatbot:
    def __init__(self):
        # Initialize Groq client
        self.groq_client = AsyncGroq(api_key=config.GROQ_API_KEY)
        
        # Initialize Embedding Service
        self.embedding_service = get_embedding_service()

        # Load and process the input text
        legal_text = """
        Legal Document Templates and Information:

        1. Affidavit: A written statement confirmed by oath or affirmation, used as evidence in court. 
           Steps to create: Gather facts, draft statement, sign before notary, file with court.

        2. Power of Attorney: A legal document that gives one person the power to act for another in legal or financial matters.
           Types: General, Limited, Durable. Steps: Choose type, select agent, draft document, sign and notarize.

        3. Will: A legal document expressing a person's wishes regarding the disposition of their property after death.
           Requirements: Must be in writing, signed by testator, witnessed by at least two people.
           Steps: List assets, name beneficiaries, appoint executor, sign with witnesses.

        4. Lease Agreement: A contract between landlord and tenant outlining terms of rental.
           Key elements: Parties involved, property description, rent amount, duration, responsibilities.
           Steps: Negotiate terms, draft agreement, review with legal counsel, sign by both parties.

        5. Employment Contract: Agreement between employer and employee defining terms of employment.
           Includes: Job duties, compensation, benefits, termination conditions.
           Steps: Define position, negotiate terms, draft contract, obtain signatures.

        6. Non-Disclosure Agreement (NDA): Contract where parties agree not to disclose confidential information.
           Types: Unilateral, Bilateral, Multilateral.
           Steps: Identify confidential information, define scope, set duration, sign agreement.

        7. Service Agreement: Contract for provision of services between service provider and client.
           Elements: Scope of work, payment terms, timelines, liability clauses.
           Steps: Define services, agree on pricing, draft terms, execute contract.

        8. Partnership Agreement: Document outlining terms of partnership between business partners.
           Covers: Profit sharing, decision making, dispute resolution, exit strategies.
           Steps: Discuss terms, draft agreement, consult lawyer, sign by all partners.

        9. Loan Agreement: Contract between lender and borrower specifying loan terms.
           Includes: Principal amount, interest rate, repayment schedule, collateral.
           Steps: Negotiate terms, draft agreement, secure collateral if needed, sign contract.

        10. Copyright License: Agreement granting permission to use copyrighted material.
            Types: Exclusive, Non-exclusive, Perpetual.
            Steps: Identify work, define usage rights, set royalties, execute license.

        Important Legal Principles:
        - All contracts must have offer, acceptance, consideration, and legal capacity.
        - Documents should be clear, unambiguous, and legally enforceable.
        - Always consult with qualified legal professionals for specific situations.
        - Laws vary by jurisdiction; ensure compliance with local regulations.
        """
        
        # Process the hardcoded text
        self.chunked_texts, self.embeddings, self.chunks = self.semantic_chunking(legal_text)


    def encode_text(self, text):
        """Encode text into embeddings using the hosted service."""
        # The service returns a numpy array directly
        return self.embedding_service.encode_single(text)
    
    def chunk_text(self, text):
        """Chunk the text into smaller pieces using simple word splitting."""
        # Simple splitting to avoid transformers dependency
        max_chunk_size = 100  # Define chunk size (adjust as needed)
        words = text.split()
        word_chunks = [words[i:i + max_chunk_size] for i in range(0, len(words), max_chunk_size)]
        text_chunks = [" ".join(chunk) for chunk in word_chunks]
        return text_chunks
    
    def determine_optimal_clusters(self, embeddings, max_clusters=10):
        """Determine the optimal number of clusters using the Elbow Method and Silhouette Score."""
        # Handle edge case with too few samples
        if len(embeddings) < 2:
            return 1
            
        distortions = []
        silhouette_scores = []
        # Max clusters cannot be more than samples
        effective_max = min(max_clusters, len(embeddings))
        K = range(2, effective_max + 1)
        
        if len(K) == 0:
            return 1
            
        for k in K:
            kmeans = KMeans(n_clusters=k, n_init=10, random_state=0)
            kmeans.fit(embeddings)
            labels = kmeans.labels_
            distortions.append(kmeans.inertia_)
            if k > 1:
                silhouette_scores.append(silhouette_score(embeddings, labels))
        
        if silhouette_scores:
            optimal_clusters = K[1:][np.argmax(silhouette_scores)]
        else:
            optimal_clusters = 1 # Default to 1 if no scores derived
        
        return optimal_clusters
    
    def semantic_chunking(self, text):
        """Perform semantic chunking on the text using dynamic clustering."""
        chunks = self.chunk_text(text)
        if not chunks:
            return {}, np.array([]), []
            
        embeddings_list = [self.encode_text(chunk) for chunk in chunks]
        if not embeddings_list:
             return {}, np.array([]), []
             
        # Stack embeddings (ensure 2D)
        embeddings = np.vstack(embeddings_list)
        
        # Determine the optimal number of clusters
        optimal_clusters = self.determine_optimal_clusters(embeddings)
        
        # Perform KMeans clustering with the optimal number of clusters
        kmeans = KMeans(n_clusters=optimal_clusters, n_init=10, random_state=0)
        kmeans.fit(embeddings)
        labels = kmeans.labels_
        
        # Group chunks by cluster
        chunked_texts = {i: [] for i in range(optimal_clusters)}
        for i, label in enumerate(labels):
            chunked_texts[label].append(chunks[i])

        return chunked_texts, embeddings, chunks
    
    def retrieve_chunks(self, query, top_n=5):
        """Retrieve and return the most similar chunks based on a query."""
        if len(self.chunks) == 0:
            return ""
            
        query_embedding = self.encode_text(query)
        
        # Compute cosine similarities
        # Reshape query if needed (1, D)
        if query_embedding.ndim == 1:
            query_embedding = query_embedding.reshape(1, -1)
            
        similarities = cosine_similarity(query_embedding, self.embeddings).flatten()
        
        # Get indices of the top_n most similar chunks
        top_n = min(top_n, len(self.chunks))
        top_indices = np.argsort(similarities)[-top_n:][::-1]
        
        # Retrieve the most similar chunks and join them into a single string
        retrieved_chunks = " ".join(self.chunks[index] for index in top_indices)
        
        return retrieved_chunks
    
    def process_text(self, file_path):
        """Read and process the input text from a file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                input_text = file.read()
            return self.semantic_chunking(input_text)
        except Exception as e:
            print(f"Error processing text file: {e}")
            return {}, np.array([]), []
    
    async def generate_response(self, question):
        """Generate a response to a given question using Groq."""
        # Retrieve and print chunks related to the query
        context = self.retrieve_chunks(question)

        messages = [
            {
                "role": "system",
                "content": """You are a helpful assistant that responds to the user based on the context provided, if the answer does not lie in the context, you will respond with that is not my area of expertise, I am a chatbot designed for Vidi-Lekhak, a platform to help users know and create legal documents. You will refer to Vidhi-Lekhak as "our" platform. You are the assistant for the vidhilekhak platform. If any document is mentioned by the user you will also give the steps to generate it."""
            },
            {
                "role": "user",
                "content": f"Context: {context}\nQuestion: {question}"
            }
        ]

        try:
            stream = await self.groq_client.chat.completions.create(
                messages=messages,
                model="llama-3.3-70b-versatile",
                temperature=0.5,
                max_completion_tokens=1024,
                top_p=1,
                stream=True,
            )

            async for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
        except Exception as e:
            yield f"Error generating response: {str(e)}"

# Global instance
# We wrap this in a try-except or lazy load to avoid failure if env vars are missing
chatbot = None
try:
    chatbot = AIChatbot()
except Exception as e:
    print(f"Failed to initialize Chatbot (Warning): {e}")

@doc_gen_router.post("/ask/")
async def ask_question(request: Request):
    global chatbot
    if not chatbot:
         return StreamingResponse(iter(["Error: Chatbot not initialized"]), media_type="text/plain")

    # Extract question from the request
    request_data = await request.json()
    question = request_data.get("question", "")

    # Create an async generator wrapper for streaming
    async def generate_stream():
        async for chunk in chatbot.generate_response(question):
            yield f"data: {chunk}\n\n"

    # Stream the response back to the client
    return StreamingResponse(generate_stream(), media_type="text/plain")

# Run the server with: uvicorn script_name:app --reload
