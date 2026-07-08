from rapidfuzz import fuzz

class FuzzySearch:
    def __init__(self, metadata):
        self.metadata = metadata

    def search(self, query: str, top_k: int) -> dict:
        results = {}
        q_lower = query.lower()
        
        for idx, meta in enumerate(self.metadata):
            name = meta.get("Medicine Name", "").lower()
            generic = meta.get("Composition", "").lower()
            
            # Use partial_ratio to match substrings well
            name_score = fuzz.partial_ratio(q_lower, name) / 100.0
            generic_score = fuzz.partial_ratio(q_lower, generic) / 100.0
            
            max_score = max(name_score, generic_score)
            
            if max_score > 0.6: # Only consider loosely matching items
                results[idx] = max_score
                
        # Sort and return top_k
        sorted_results = sorted(results.items(), key=lambda x: x[1], reverse=True)[:top_k]
        return {idx: score for idx, score in sorted_results}

    def exact_match_score(self, query: str) -> dict:
        results = {}
        q_lower = query.lower()
        
        for idx, meta in enumerate(self.metadata):
            name = meta.get("Medicine Name", "").lower()
            if q_lower in name or name in q_lower:
                results[idx] = 1.0
                
        return results
