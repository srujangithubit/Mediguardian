import os
import pickle
import time
from .config import METADATA_PATH, TOP_K, MAX_RESULTS, CACHE_SIZE
from .query_normalizer import QueryNormalizer
from .spell_corrector import SpellCorrector
from .synonym_expander import SynonymExpander
from .intent_classifier import IntentClassifier
from .metadata_filter import MetadataFilter
from .embedding_search import EmbeddingSearch
from .bm25_search import BM25Search
from .fuzzy_search import FuzzySearch
from .hybrid_ranker import HybridRanker
from .clustering import Clustering
from .confidence_scorer import ConfidenceScorer
from .response_formatter import ResponseFormatter
from .cache import search_cache

class HybridSearchEngine:
    def __init__(self):
        print("Initializing Hybrid Search Engine...")
        
        # Load metadata
        self.metadata = []
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, 'rb') as f:
                self.metadata = pickle.load(f)
                
        # Initialize modules
        self.normalizer = QueryNormalizer()
        self.corrector = SpellCorrector()
        self.expander = SynonymExpander()
        self.classifier = IntentClassifier()
        self.filterer = MetadataFilter()
        
        self.embedding_search = EmbeddingSearch()
        self.bm25_search = BM25Search()
        self.fuzzy_search = FuzzySearch(self.metadata)
        
        self.ranker = HybridRanker(self.metadata)
        self.clusterer = Clustering()
        self.scorer = ConfidenceScorer()
        self.formatter = ResponseFormatter()

    @search_cache(maxsize=CACHE_SIZE)
    def search(self, raw_query: str):
        start_time = time.time()
        
        # 1. Pre-Search Processing
        normalized = self.normalizer.normalize(raw_query)
        corrected = self.corrector.correct(normalized)
        expanded = self.expander.expand(corrected)
        
        # Detect Intent
        intent = self.classifier.classify(expanded)
        weights = self.classifier.get_weights(intent)
        
        # 2. Retrieval
        retrieval_start = time.time()
        faiss_results = self.embedding_search.search(expanded, intent, TOP_K)
        bm25_results = self.bm25_search.search(expanded, TOP_K)
        exact_results = self.fuzzy_search.exact_match_score(corrected) # Use corrected, not expanded for exact
        fuzzy_results = self.fuzzy_search.search(corrected, TOP_K)
        retrieval_time = time.time() - retrieval_start
        
        # 3. Post-Search Processing
        ranking_start = time.time()
        
        # Rank
        ranked = self.ranker.rank(
            faiss_results, 
            bm25_results, 
            exact_results, 
            fuzzy_results, 
            weights, 
            TOP_K
        )
        
        # Filter (metadata)
        filters = self.filterer.extract_filters(raw_query)
        filtered = self.filterer.apply_filters(ranked, filters)
        
        # Cluster duplicates
        clustered = self.clusterer.cluster(filtered)
        
        # Top N
        top_clusters = clustered[:MAX_RESULTS]
        
        # Score confidence
        scored = self.scorer.score(top_clusters)
        
        # Format response
        response = self.formatter.format(raw_query, scored)
        ranking_time = time.time() - ranking_start
        
        total_time = time.time() - start_time
        
        # Add metadata for debugging
        response["debug"] = {
            "normalized": normalized,
            "corrected": corrected,
            "expanded": expanded,
            "intent": intent,
            "weights": weights,
            "filters_applied": filters,
            "timing": {
                "total": f"{total_time:.3f}s",
                "retrieval": f"{retrieval_time:.3f}s",
                "ranking": f"{ranking_time:.3f}s"
            }
        }
        
        print(f"Query: '{raw_query}' | Intent: {intent} | Time: {total_time:.3f}s")
        return response
