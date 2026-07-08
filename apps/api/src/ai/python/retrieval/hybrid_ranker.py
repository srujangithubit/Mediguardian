class HybridRanker:
    def __init__(self, metadata):
        self.metadata = metadata

    def rank(self, faiss_results: dict, bm25_results: dict, exact_results: dict, fuzzy_results: dict, weights: dict, top_k: int) -> list:
        combined_scores = {}
        
        # Collect all unique indices
        all_indices = set(faiss_results.keys()) | set(bm25_results.keys()) | set(exact_results.keys()) | set(fuzzy_results.keys())
        
        for idx in all_indices:
            # Get individual scores (default to 0 if not found)
            f_score = faiss_results.get(idx, 0.0)
            b_score = bm25_results.get(idx, 0.0)
            e_score = exact_results.get(idx, 0.0)
            fz_score = fuzzy_results.get(idx, 0.0)
            
            # Simple popularity metric: % of excellent reviews (normalized 0-1)
            pop = self.metadata[idx].get("Excellent Review %", 0)
            pop_score = 0.0
            try:
                pop_score = float(pop) / 100.0 if pop else 0.0
            except:
                pass
                
            # Compute weighted sum
            final_score = (
                (f_score * weights.get("faiss", 0.0)) +
                (b_score * weights.get("bm25", 0.0)) +
                (e_score * weights.get("exact", 0.0)) +
                (fz_score * weights.get("fuzzy", 0.0)) +
                (pop_score * weights.get("popularity", 0.0))
            )
            
            combined_scores[idx] = final_score
            
        # Sort by final score descending
        sorted_indices = sorted(combined_scores.keys(), key=lambda i: combined_scores[i], reverse=True)
        
        results = []
        for idx in sorted_indices[:top_k]:
            result = {
                "metadata": self.metadata[idx],
                "score": combined_scores[idx],
                "components": {
                    "faiss": faiss_results.get(idx, 0.0),
                    "bm25": bm25_results.get(idx, 0.0),
                    "exact": exact_results.get(idx, 0.0),
                    "fuzzy": fuzzy_results.get(idx, 0.0)
                }
            }
            results.append(result)
            
        return results
