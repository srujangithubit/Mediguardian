class ResponseFormatter:
    def format(self, query: str, clustered_results: list) -> dict:
        formatted_results = []
        
        for cluster in clustered_results:
            meta = cluster["metadata"]
            
            # Safely parse uses and side effects (handle float nan if any)
            uses_str = meta.get("Uses", "")
            uses = [u.strip() for u in str(uses_str).split(",")] if uses_str and str(uses_str).strip() else []
            
            side_effects_str = meta.get("Side_effects", "")
            side_effects = [s.strip() for s in str(side_effects_str).split(",")] if side_effects_str and str(side_effects_str).strip() else []
            
            formatted_results.append({
                "name": cluster["name"],
                "confidence": cluster["confidence"],
                "stars": cluster["stars"],
                "composition": meta.get("Composition", "Unknown"),
                "uses": uses,
                "side_effects": side_effects,
                "manufacturer": meta.get("Manufacturer", "Unknown"),
                "variants": [v["name"] for v in cluster["variants"]],
                "reviews": {
                    "excellent": meta.get("Excellent Review %", 0),
                    "average": meta.get("Average Review %", 0),
                    "poor": meta.get("Poor Review %", 0)
                }
            })
            
        return {
            "query": query,
            "results": formatted_results
        }
