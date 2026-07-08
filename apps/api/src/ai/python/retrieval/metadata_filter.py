class MetadataFilter:
    def __init__(self):
        self.form_types = {"syrup", "tablet", "capsule", "injection", "drop", "ointment", "cream", "gel"}
        self.age_groups = {"child", "children", "pediatric", "kid", "adult", "infant"}
        
    def extract_filters(self, query: str) -> dict:
        q_lower = query.lower()
        tokens = set(q_lower.split())
        
        filters = {}
        
        # Check form types
        forms_in_query = tokens.intersection(self.form_types)
        if forms_in_query:
            filters["form"] = list(forms_in_query)[0]
            
        # Check age groups
        if "child" in tokens or "children" in tokens or "pediatric" in tokens or "kid" in tokens:
            filters["age_group"] = "pediatric"
        elif "adult" in tokens:
            filters["age_group"] = "adult"
            
        return filters
        
    def apply_filters(self, results: list, filters: dict) -> list:
        if not filters:
            return results
            
        filtered_results = []
        for result in results:
            meta = result.get("metadata", {})
            name = meta.get("Medicine Name", "").lower()
            uses = meta.get("Uses", "").lower()
            
            keep = True
            
            # Apply form filter
            if "form" in filters:
                form = filters["form"]
                if form not in name and form not in uses:
                    # In a real app we'd have a specific metadata field for form,
                    # but here we'll check the name/uses as a proxy.
                    keep = False
                    
            if keep:
                filtered_results.append(result)
                
        return filtered_results
