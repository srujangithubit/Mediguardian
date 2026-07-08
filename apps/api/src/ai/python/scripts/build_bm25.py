import os
import json
import pandas as pd
import pickle
import sys
from rank_bm25 import BM25Okapi

# Add parent directory to path so we can import from retrieval.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from retrieval.config import MEDICINES_CSV, BM25_INDEX_PATH

def build_bm25():
    print("Loading dataset...")
    if not os.path.exists(MEDICINES_CSV):
        print(f"Error: {MEDICINES_CSV} not found!")
        return

    df = pd.read_csv(MEDICINES_CSV)
    df = df.fillna("")
    
    print("Tokenizing corpus for BM25...")
    tokenized_corpus = []
    
    for _, row in df.iterrows():
        # Rich tokenization using multiple fields
        text = f"{row['Medicine Name']} {row['Composition']} {row['Uses']} {row['Manufacturer']}"
        tokens = str(text).lower().split()
        tokenized_corpus.append(tokens)
        
    print(f"Building BM25 index over {len(tokenized_corpus)} documents...")
    bm25 = BM25Okapi(tokenized_corpus)
    
    print(f"Saving BM25 index to {BM25_INDEX_PATH}...")
    with open(BM25_INDEX_PATH, 'wb') as f:
        pickle.dump(bm25, f)
        
    print("BM25 build complete.")

if __name__ == "__main__":
    build_bm25()
