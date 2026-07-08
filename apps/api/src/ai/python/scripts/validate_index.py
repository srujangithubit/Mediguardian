import os
import sys

# Add parent directory to path so we can import from retrieval.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from retrieval.config import (
    FAISS_MEDICINE, 
    FAISS_DISEASE, 
    FAISS_COMPOSITION, 
    FAISS_MANUFACTURER, 
    FAISS_SYMPTOM,
    METADATA_PATH,
    BM25_INDEX_PATH,
    VOCAB_PATH
)

def validate():
    files = [
        FAISS_MEDICINE,
        FAISS_DISEASE,
        FAISS_COMPOSITION,
        FAISS_MANUFACTURER,
        FAISS_SYMPTOM,
        METADATA_PATH,
        BM25_INDEX_PATH,
        VOCAB_PATH
    ]
    
    all_ok = True
    for f in files:
        if os.path.exists(f):
            size = os.path.getsize(f) / (1024 * 1024) # MB
            print(f"✅ Found {os.path.basename(f)} ({size:.2f} MB)")
        else:
            print(f"❌ Missing {os.path.basename(f)}")
            all_ok = False
            
    if all_ok:
        print("\nAll index files built successfully!")
    else:
        print("\nSome index files are missing. Please run all build scripts.")

if __name__ == "__main__":
    validate()
