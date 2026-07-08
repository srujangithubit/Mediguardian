import os
import pickle
from .config import BM25_INDEX_PATH

class BM25Search:
    def __init__(self):
        self.bm25 = None
        if os.path.exists(BM25_INDEX_PATH):
            with open(BM25_INDEX_PATH, 'rb') as f:
                self.bm25 = pickle.load(f)

    def search(self, query: str, top_k: int) -> dict:
        if not self.bm25:
            return {}
            
        tokens = query.split()
        doc_scores = self.bm25.get_scores(tokens)
        
        # Get top k indices and scores
        import numpy as np
        # Handle case where corpus might be smaller than top_k
        k = min(top_k, len(doc_scores))
        top_indices = np.argsort(doc_scores)[::-1][:k]
        
        results = {}
        max_score = np.max(doc_scores) if len(doc_scores) > 0 and np.max(doc_scores) > 0 else 1.0
        
        for idx in top_indices:
            score = doc_scores[idx]
            if score > 0:
                # Normalize score loosely between 0 and 1 relative to max_score
                normalized_score = score / max_score
                results[int(idx)] = float(normalized_score)
                
        return results
