import os
import faiss
from sentence_transformers import SentenceTransformer
from .config import (
    FAISS_MEDICINE,
    FAISS_DISEASE,
    FAISS_COMPOSITION,
    FAISS_MANUFACTURER,
    FAISS_SYMPTOM,
    EMBEDDING_MODEL_NAME
)

class EmbeddingSearch:
    def __init__(self):
        print(f"Loading embedding model for retrieval: {EMBEDDING_MODEL_NAME}...")
        self.model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        
        self.indices = {}
        
        # Load available indices
        if os.path.exists(FAISS_MEDICINE):
            self.indices["medicine"] = faiss.read_index(FAISS_MEDICINE)
        if os.path.exists(FAISS_DISEASE):
            self.indices["disease"] = faiss.read_index(FAISS_DISEASE)
        if os.path.exists(FAISS_COMPOSITION):
            self.indices["composition"] = faiss.read_index(FAISS_COMPOSITION)
        if os.path.exists(FAISS_MANUFACTURER):
            self.indices["manufacturer"] = faiss.read_index(FAISS_MANUFACTURER)
        if os.path.exists(FAISS_SYMPTOM):
            self.indices["symptom"] = faiss.read_index(FAISS_SYMPTOM)

    def search(self, query: str, intent: str, top_k: int) -> dict:
        # Default to medicine index if intent index doesn't exist
        target_index = intent if intent in self.indices else "medicine"
        index = self.indices.get(target_index)
        
        if not index:
            return {}
            
        query_vector = self.model.encode([query])
        faiss.normalize_L2(query_vector)
        
        distances, idxs = index.search(query_vector, top_k)
        
        results = {}
        for i, doc_idx in enumerate(idxs[0]):
            if doc_idx != -1:
                # Inner product distance is bounded differently; but let's treat it as a normalized score
                score = float(distances[0][i])
                # Ensure score is roughly in 0-1 range
                score = max(0.0, min(1.0, score))
                results[int(doc_idx)] = score
                
        return results
