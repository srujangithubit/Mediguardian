import os
import pickle
import pandas as pd
import faiss
from sentence_transformers import SentenceTransformer
import sys

# Add parent directory to path so we can import from retrieval.config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from retrieval.config import (
    MEDICINES_CSV, 
    FAISS_MEDICINE, 
    FAISS_DISEASE, 
    FAISS_COMPOSITION, 
    FAISS_MANUFACTURER, 
    FAISS_SYMPTOM,
    METADATA_PATH,
    EMBEDDING_MODEL_NAME
)

def build_embeddings():
    print(f"Loading embedding model {EMBEDDING_MODEL_NAME}...")
    model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    
    print("Loading dataset...")
    df = pd.read_csv(MEDICINES_CSV)
    df = df.fillna("")
    
    metadata = []
    
    # Texts to embed for each index
    medicine_texts = []
    disease_texts = []
    composition_texts = []
    manufacturer_texts = []
    symptom_texts = []
    
    print("Preparing texts for multiple indexes...")
    for _, row in df.iterrows():
        meta = {
            "Medicine Name": row["Medicine Name"],
            "Composition": row["Composition"],
            "Uses": row["Uses"],
            "Side_effects": row["Side_effects"],
            "Manufacturer": row["Manufacturer"],
            "Excellent Review %": row["Excellent Review %"],
            "Average Review %": row["Average Review %"],
            "Poor Review %": row["Poor Review %"]
        }
        metadata.append(meta)
        
        # 1. Medicine Index: Everything combined for rich representation
        med_text = f"Medicine: {row['Medicine Name']} Composition: {row['Composition']} Uses: {row['Uses']} Side Effects: {row['Side_effects']} Manufacturer: {row['Manufacturer']}"
        medicine_texts.append(med_text)
        
        # 2. Disease/Uses Index: Focus heavily on uses
        disease_texts.append(f"Uses: {row['Uses']} Medicine: {row['Medicine Name']}")
        
        # 3. Composition Index: Focus on ingredients
        composition_texts.append(f"Composition: {row['Composition']} Medicine: {row['Medicine Name']}")
        
        # 4. Manufacturer Index
        manufacturer_texts.append(f"Manufacturer: {row['Manufacturer']} Medicine: {row['Medicine Name']}")
        
        # 5. Symptom/Side Effect Index
        symptom_texts.append(f"Symptoms and Side Effects: {row['Side_effects']} Medicine: {row['Medicine Name']}")

    def embed_and_save(texts, index_path, name):
        print(f"Embedding {len(texts)} items for {name} index...")
        embeddings = model.encode(texts, show_progress_bar=True)
        faiss.normalize_L2(embeddings)
        
        dim = embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(embeddings)
        
        print(f"Saving {name} index to {index_path}...")
        faiss.write_index(index, index_path)

    embed_and_save(medicine_texts, FAISS_MEDICINE, "Medicine")
    embed_and_save(disease_texts, FAISS_DISEASE, "Disease")
    embed_and_save(composition_texts, FAISS_COMPOSITION, "Composition")
    embed_and_save(manufacturer_texts, FAISS_MANUFACTURER, "Manufacturer")
    embed_and_save(symptom_texts, FAISS_SYMPTOM, "Symptom")

    print(f"Saving metadata to {METADATA_PATH}...")
    with open(METADATA_PATH, 'wb') as f:
        pickle.dump(metadata, f)
        
    print("All embeddings built and saved successfully!")

if __name__ == "__main__":
    build_embeddings()
