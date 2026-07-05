"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Check, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function GroceryList() {
  const { selectedMemberId } = useAuth();
  const { data } = useFetch<{ groceryList?: any[] }>(
    selectedMemberId ? `/ai/food-recommendations?familyMemberId=${selectedMemberId}` : null
  );

  const initialItems = (data?.groceryList || []).map((item: any, idx: number) => ({
    id: idx + 1,
    name: typeof item === "string" ? item : item.name || item,
    checked: false,
  }));

  const [items, setItems] = useState<{ id: number; name: string; checked: boolean }[]>([]);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Update items when data loads
  if (initialItems.length > 0 && !hasInitialized) {
    setItems(initialItems);
    setHasInitialized(true);
  }

  const toggle = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <ShoppingCart size={20} className="text-emerald-500" />
            Smart Grocery
          </h2>
          <p className="text-sm text-text/60">Auto-generated from diet plan.</p>
        </div>
        <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-2 scrollbar-hide">
        {items.length === 0 ? (
          <div className="text-center text-text/40 text-sm py-8">
            Grocery list will appear after food recommendations are generated.
          </div>
        ) : (
          items.map((item, i) => (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => toggle(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                item.checked 
                  ? "bg-white/5 border-transparent opacity-60" 
                  : "bg-background/50 border-white/5 hover:border-white/10"
              }`}
            >
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                item.checked ? "bg-accent border-accent text-white" : "border-white/20 text-transparent"
              }`}>
                <Check size={12} />
              </div>
              <span className={`text-sm font-medium ${item.checked ? "line-through text-text/60" : ""}`}>
                {item.name}
              </span>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}
