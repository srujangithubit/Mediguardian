class ConfidenceScorer:
    def score(self, clustered_results: list) -> list:
        if not clustered_results:
            return []
            
        # Add confidence to each cluster
        for i, cluster in enumerate(clustered_results):
            score = cluster["score"]
            delta = 0.0
            
            if i < len(clustered_results) - 1:
                delta = score - clustered_results[i+1]["score"]
                
            # Heuristic calculation
            # Max possible score is theoretically 1.0, but practically lower.
            # If score > 0.8 it's very high.
            # If delta > 0.2, it's very distinct from the next result.
            
            confidence = (score * 80) + (delta * 20)
            
            # Bound between 10% and 99%
            confidence = max(10.0, min(99.0, confidence * 100))
            
            # Format stars based on confidence
            if confidence > 90:
                stars = "★★★★★"
            elif confidence > 75:
                stars = "★★★★☆"
            elif confidence > 60:
                stars = "★★★☆☆"
            elif confidence > 40:
                stars = "★★☆☆☆"
            else:
                stars = "★☆☆☆☆"
                
            cluster["confidence"] = round(confidence)
            cluster["stars"] = stars
            
        return clustered_results
