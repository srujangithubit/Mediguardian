import json
import os
from rapidfuzz import process, fuzz
from .config import VOCAB_PATH

class SpellCorrector:
    def __init__(self):
        self.vocab = []
        if os.path.exists(VOCAB_PATH):
            with open(VOCAB_PATH, 'r', encoding='utf-8') as f:
                self.vocab = json.load(f)

    def correct(self, query: str) -> str:
        if not self.vocab:
            return query
            
        tokens = query.split()
        corrected_tokens = []
        
        for token in tokens:
            # If the token is short, don't attempt to correct it, it might just get worse
            if len(token) <= 3:
                corrected_tokens.append(token)
                continue
                
            # Find the best match in the vocabulary
            # Using partial_ratio for fuzzy matching
            best_match = process.extractOne(
                token, 
                self.vocab, 
                scorer=fuzz.ratio,
                score_cutoff=85.0
            )
            
            if best_match:
                # best_match is typically a tuple (match_string, score, index)
                corrected_tokens.append(best_match[0])
            else:
                corrected_tokens.append(token)
                
        return " ".join(corrected_tokens)
