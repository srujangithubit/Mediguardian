import re
import os
from .config import STOPWORDS_PATH

class QueryNormalizer:
    def __init__(self):
        self.stopwords = set()
        if os.path.exists(STOPWORDS_PATH):
            with open(STOPWORDS_PATH, 'r', encoding='utf-8') as f:
                self.stopwords = set([line.strip().lower() for line in f if line.strip()])

    def normalize(self, query: str) -> str:
        # Convert to lowercase
        q = query.lower()
        # Remove punctuation except alphanumeric and spaces
        q = re.sub(r'[^\w\s]', ' ', q)
        # Remove multiple spaces
        q = re.sub(r'\s+', ' ', q).strip()
        
        # Remove stopwords
        tokens = q.split()
        filtered_tokens = [t for t in tokens if t not in self.stopwords]
        
        return " ".join(filtered_tokens) if filtered_tokens else q
