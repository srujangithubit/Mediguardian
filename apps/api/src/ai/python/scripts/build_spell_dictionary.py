import os
import json
import pandas as pd
import re
import sys

# Add parent directory to path so we can import from retrieval.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from retrieval.config import MEDICINES_CSV, VOCAB_PATH

def build_vocab():
    print("Loading dataset...")
    if not os.path.exists(MEDICINES_CSV):
        print(f"Error: {MEDICINES_CSV} not found!")
        return

    df = pd.read_csv(MEDICINES_CSV)
    
    vocab = set()
    
    def tokenize(text):
        if pd.isna(text):
            return []
        # Convert to lower, keep only alphanumeric
        clean = re.sub(r'[^\w\s]', ' ', str(text).lower())
        return [w for w in clean.split() if len(w) > 3]

    print("Extracting tokens from Medicine Name...")
    for text in df['Medicine Name']:
        vocab.update(tokenize(text))

    print("Extracting tokens from Composition...")
    for text in df['Composition']:
        vocab.update(tokenize(text))

    print("Extracting tokens from Uses...")
    for text in df['Uses']:
        vocab.update(tokenize(text))

    print("Extracting tokens from Side Effects...")
    for text in df['Side_effects']:
        vocab.update(tokenize(text))
        
    vocab_list = list(vocab)
    vocab_list.sort()
    
    print(f"Built vocabulary of {len(vocab_list)} unique words.")
    
    with open(VOCAB_PATH, 'w', encoding='utf-8') as f:
        json.load(f) if os.path.exists(VOCAB_PATH) and os.path.getsize(VOCAB_PATH) > 0 else None
        json.dump(vocab_list, f, indent=2)
        
    print(f"Saved vocabulary to {VOCAB_PATH}")

if __name__ == "__main__":
    build_vocab()
