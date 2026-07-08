import functools

# Basic LRU Cache for search functions to cache identical queries
def search_cache(maxsize=100):
    return functools.lru_cache(maxsize=maxsize)
