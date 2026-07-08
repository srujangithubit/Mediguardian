import pandas as pd
import numpy as np
import pickle
from sentence_transformers import SentenceTransformer
import faiss
import os

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV_PATH = os.path.join(BASE_DIR, "data", "Medicine_Details.csv")
INDEX_PATH = os.path.join(BASE_DIR, "vector_store", "medicine.faiss")
METADATA_PATH = os.path.join(BASE_DIR, "vector_store", "metadata.pkl")
MODEL_NAME = "BAAI/bge-small-en-v1.5"

def load_and_preprocess_data(csv_path):
    print(f"Loading dataset from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    print(f"Loaded {len(df)} rows. Cleaning data...")
    # Fill missing values
    df.fillna("Unknown", inplace=True)
    
    # Create structured text representation
    def format_row(row):
        return (
            f"Medicine Name: {row['Medicine Name']}\n"
            f"Composition: {row['Composition']}\n"
            f"Uses: {row['Uses']}\n"
            f"Side Effects: {row['Side_effects']}\n"
            f"Manufacturer: {row['Manufacturer']}"
        )
        
    df['structured_text'] = df.apply(format_row, axis=1)
    
    # Store metadata 
    metadata = df.to_dict('records')
    texts = df['structured_text'].tolist()
    
    return texts, metadata

def train_embeddings():
    # Ensure output directory exists
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    
    texts, metadata = load_and_preprocess_data(CSV_PATH)
    
    print(f"Loading embedding model: {MODEL_NAME}")
    # Load embedding model
    model = SentenceTransformer(MODEL_NAME)
    
    print("Generating embeddings... This may take a few minutes.")
    # Generate embeddings
    embeddings = model.encode(texts, show_progress_bar=True, batch_size=64)
    
    # Normalize embeddings for cosine similarity (FAISS Inner Product = Cosine if normalized)
    faiss.normalize_L2(embeddings)
    
    dimension = embeddings.shape[1]
    print(f"Creating FAISS Index with dimension {dimension}...")
    
    # Create FAISS Index
    index = faiss.IndexFlatIP(dimension) # Inner Product for Cosine Similarity
    index.add(embeddings)
    
    print(f"Saving FAISS index to {INDEX_PATH}")
    faiss.write_index(index, INDEX_PATH)
    
    print(f"Saving metadata to {METADATA_PATH}")
    with open(METADATA_PATH, 'wb') as f:
        pickle.dump(metadata, f)
        
    print("Training complete!")

if __name__ == "__main__":
    train_embeddings()
