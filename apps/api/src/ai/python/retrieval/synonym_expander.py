import json
import os
from .config import DISEASE_ALIASES, MEDICINE_ALIASES, COMPOSITION_ALIASES

class SynonymExpander:
    def __init__(self):
        self.aliases = {}
        self._load_aliases(DISEASE_ALIASES)
        self._load_aliases(MEDICINE_ALIASES)
        self._load_aliases(COMPOSITION_ALIASES)

    def _load_aliases(self, path):
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                for key, values in data.items():
                    key_lower = key.lower()
                    if key_lower not in self.aliases:
                        self.aliases[key_lower] = set()
                    self.aliases[key_lower].update([v.lower() for v in values])
                    
                    # Reverse map for two-way expansion
                    for v in values:
                        v_lower = v.lower()
                        if v_lower not in self.aliases:
                            self.aliases[v_lower] = set()
                        self.aliases[v_lower].add(key_lower)

    def expand(self, query: str) -> str:
        tokens = query.split()
        expanded_tokens = set(tokens)
        
        # One hop
        for token in tokens:
            if token in self.aliases:
                expanded_tokens.update(self.aliases[token])
                
        # Two hop
        two_hop = set(expanded_tokens)
        for token in expanded_tokens:
            if token in self.aliases:
                two_hop.update(self.aliases[token])
                
        return " ".join(two_hop)
