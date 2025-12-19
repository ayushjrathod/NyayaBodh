import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.metrics.pairwise import cosine_similarity
from groq import AsyncGroq
import asyncio
import os
from ..utils.config import config


# Configuration
embedding_model_name = config.EMBEDDING_MODEL
max_chunk_size = config.MAX_CHUNK_SIZE


class AIChatbot:
    def __init__(self):
        # Initialize Groq client
        self.groq_client = AsyncGroq(api_key=config.GROQ_API_KEY)
        
        # Load the embedding model for semantic chunking
        self.embedding_tokenizer = AutoTokenizer.from_pretrained(embedding_model_name)
        self.embedding_model = AutoModel.from_pretrained(embedding_model_name)

    def encode_text(self, text):
        """Encode text into embeddings using a pre-trained model."""
        inputs = self.embedding_tokenizer(text, return_tensors='pt', truncation=True, padding=True)
        with torch.no_grad():
            outputs = self.embedding_model(**inputs)
        embeddings = outputs.last_hidden_state.mean(dim=1).numpy()
        return embeddings
    
    def chunk_text(self, text):
        """Chunk the text into smaller pieces."""
        tokens = self.embedding_tokenizer.tokenize(text)
        token_chunks = [tokens[i:i + max_chunk_size] for i in range(0, len(tokens), max_chunk_size)]
        text_chunks = [self.embedding_tokenizer.convert_tokens_to_string(chunk) for chunk in token_chunks]
        return text_chunks
    
    def determine_optimal_clusters(self, embeddings, max_clusters=10):
        """Determine the optimal number of clusters."""
        distortions = []
        silhouette_scores = []
        K = range(2, max_clusters + 1)
        
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
            optimal_clusters = K[0]
        
        return optimal_clusters
    
    def semantic_chunking(self, text):
        """Perform semantic chunking on the text using dynamic clustering."""
        chunks = self.chunk_text(text)
        embeddings = np.vstack([self.encode_text(chunk) for chunk in chunks])
        
        optimal_clusters = self.determine_optimal_clusters(embeddings)
        kmeans = KMeans(n_clusters=optimal_clusters, n_init=10, random_state=0)
        kmeans.fit(embeddings)
        labels = kmeans.labels_
        
        chunked_texts = {i: [] for i in range(optimal_clusters)}
        for i, label in enumerate(labels):
            chunked_texts[label].append(chunks[i])

        return chunked_texts, embeddings, chunks
    
    def retrieve_chunks(self, query, top_n=5):
        """Retrieve the most similar chunks based on a query."""
        query_embedding = self.encode_text(query)
        similarities = cosine_similarity(query_embedding, self.embeddings).flatten()
        top_indices = np.argsort(similarities)[-top_n:][::-1]
        retrieved_chunks = " ".join(self.chunks[index] for index in top_indices)
        return retrieved_chunks

    def process_text(self, file_path):
        """Read and process the input text from a file."""
        with open(file_path, 'r', encoding='utf-8') as file:
            input_text = file.read()
        
        return self.semantic_chunking(input_text)
    
    async def generate_response(self, question):
        """Generate a response to a given question using Groq."""
        context = self.retrieve_chunks(question)
        
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
            stream = await self.groq_client.chat.completions.create(
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
