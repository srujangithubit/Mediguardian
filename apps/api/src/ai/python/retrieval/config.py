import os

# Base paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
VECTOR_DB_DIR = os.path.join(BASE_DIR, "vector_db", "v1")

# Ensure directories exist
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(VECTOR_DB_DIR, exist_ok=True)

# File Paths
MEDICINES_CSV = os.path.join(DATA_DIR, "Medicine_Details.csv")
MEDICINES_JSON = os.path.join(DATA_DIR, "medicines.json")

# Index paths
FAISS_MEDICINE = os.path.join(VECTOR_DB_DIR, "medicine.index")
FAISS_DISEASE = os.path.join(VECTOR_DB_DIR, "disease.index")
FAISS_COMPOSITION = os.path.join(VECTOR_DB_DIR, "composition.index")
FAISS_MANUFACTURER = os.path.join(VECTOR_DB_DIR, "manufacturer.index")
FAISS_SYMPTOM = os.path.join(VECTOR_DB_DIR, "symptom.index")
METADATA_PATH = os.path.join(VECTOR_DB_DIR, "metadata.pkl")

# BM25 path
BM25_INDEX_PATH = os.path.join(VECTOR_DB_DIR, "bm25.pkl")

# Alias paths
MEDICINE_ALIASES = os.path.join(DATA_DIR, "medicine_aliases.json")
DISEASE_ALIASES = os.path.join(DATA_DIR, "disease_aliases.json")
COMPOSITION_ALIASES = os.path.join(DATA_DIR, "composition_aliases.json")

# Vocab paths
VOCAB_PATH = os.path.join(DATA_DIR, "vocab.json")
STOPWORDS_PATH = os.path.join(DATA_DIR, "stopwords.txt")

# Configuration variables
TOP_K = 15 # Fetch more initially before clustering
FUZZY_THRESHOLD = 85.0
MIN_CONFIDENCE = 50.0
MAX_RESULTS = 5
CACHE_SIZE = 100

# Default weights (overridden dynamically based on intent)
DEFAULT_WEIGHTS = {
    "exact": 0.20,
    "faiss": 0.40,
    "bm25": 0.25,
    "fuzzy": 0.10,
    "popularity": 0.05
}

# Embedding model
EMBEDDING_MODEL_NAME = "BAAI/bge-small-en-v1.5" # Keeping this since it's already downloaded and works well.
