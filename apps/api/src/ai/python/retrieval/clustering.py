class Clustering:
    def cluster(self, results: list) -> list:
        # Group by first word of medicine name (basic heuristic for family)
        # e.g., "Crocin 650", "Crocin Advance" -> "Crocin"
        
        clusters = {}
        
        for result in results:
            meta = result["metadata"]
            name = meta.get("Medicine Name", "").strip()
            if not name:
                continue
                
            # Use first word as cluster key
            base_name = name.split()[0].upper()
            
            if base_name not in clusters:
                clusters[base_name] = {
                    "cluster_name": base_name,
                    "top_score": result["score"],
                    "best_match": meta,
                    "variants": []
                }
            else:
                # Add as variant if score is lower
                clusters[base_name]["variants"].append({
                    "name": name,
                    "score": result["score"]
                })
                
        # Format output
        clustered_results = []
        for base_name, data in clusters.items():
            clustered_results.append({
                "name": data["best_match"].get("Medicine Name", base_name),
                "score": data["top_score"],
                "metadata": data["best_match"],
                "variants": data["variants"]
            })
            
        # Sort clusters by top_score
        return sorted(clustered_results, key=lambda x: x["score"], reverse=True)
