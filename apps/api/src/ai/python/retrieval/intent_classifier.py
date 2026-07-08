import re

class IntentClassifier:
    def __init__(self):
        self.medicine_keywords = {"tablet", "syrup", "capsule", "injection", "medicine", "pill", "drop", "ointment"}
        self.disease_keywords = {"fever", "headache", "pain", "cancer", "diabetes", "hypertension", "cold", "cough", "infection"}
        self.manufacturer_keywords = {"manufactures", "maker", "company", "who makes", "pharma"}
        self.composition_keywords = {"contains", "composition", "salt", "formula", "ingredient"}

    def classify(self, query: str) -> str:
        q_lower = query.lower()
        tokens = set(q_lower.split())
        
        # Heuristic matching
        if any(kw in q_lower for kw in self.manufacturer_keywords):
            return "manufacturer"
            
        if any(kw in q_lower for kw in self.composition_keywords):
            return "composition"
            
        if tokens.intersection(self.disease_keywords):
            return "disease"
            
        # Default to medicine search if no specific intent found
        return "medicine"
        
    def get_weights(self, intent: str) -> dict:
        if intent == "medicine":
            return {"exact": 0.50, "faiss": 0.20, "bm25": 0.20, "fuzzy": 0.10, "popularity": 0.0}
        elif intent == "disease":
            return {"exact": 0.10, "faiss": 0.50, "bm25": 0.30, "fuzzy": 0.10, "popularity": 0.0}
        elif intent == "manufacturer":
            return {"exact": 0.40, "faiss": 0.10, "bm25": 0.40, "fuzzy": 0.10, "popularity": 0.0}
        elif intent == "composition":
            return {"exact": 0.40, "faiss": 0.20, "bm25": 0.30, "fuzzy": 0.10, "popularity": 0.0}
            
        # Default weights
        return {"exact": 0.20, "faiss": 0.40, "bm25": 0.25, "fuzzy": 0.10, "popularity": 0.05}
