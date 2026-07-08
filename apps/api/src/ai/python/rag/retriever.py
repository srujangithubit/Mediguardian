import os
import faiss
import pickle
import numpy as np

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INDEX_PATH = os.path.join(BASE_DIR, "vector_store", "medicine.faiss")
METADATA_PATH = os.path.join(BASE_DIR, "vector_store", "metadata.pkl")

class MedicineRetriever:
    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
        
        print("Loading FAISS index...")
        self.index = faiss.read_index(INDEX_PATH)
        
        print("Loading metadata...")
        with open(METADATA_PATH, 'rb') as f:
            self.metadata = pickle.load(f)
            
    def retrieve(self, query: str, top_k: int = 5):
        # Embed the query
        query_vector = self.embedding_model.encode([query])
        
        # Normalize for Inner Product (Cosine Similarity)
        faiss.normalize_L2(query_vector)
        
        # Search the index
        distances, indices = self.index.search(query_vector, top_k)
        
        results = []
        for i, idx in enumerate(indices[0]):
            if idx != -1: # FAISS returns -1 if not enough results
                results.append({
                    "metadata": self.metadata[idx],
                    "score": float(distances[0][i])
                })
                
        return results
