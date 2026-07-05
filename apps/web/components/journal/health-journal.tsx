"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send, Mic, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { api } from "../../lib/api";

export function HealthJournal() {
  const { selectedMemberId } = useAuth();
  const [entry, setEntry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const submit = async () => {
    if (!entry.trim() || !selectedMemberId) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const data = await api.post<any>("/ai/journal", {
        familyMemberId: selectedMemberId,
        text: entry,
      });
      setResult(data);
      setEntry("");
    } catch (err: any) {
      setResult({ error: err.message || "Failed to process journal entry" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <BookOpen size={20} className="text-purple-500" />
            Health Journal
          </h2>
          <p className="text-sm text-text/60">Write about how you're feeling.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {result && !result.error ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col"
            >
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4 flex items-start gap-3">
                <Sparkles size={16} className="text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm mb-1 text-purple-500">AI Insights</h3>
                  <p className="text-sm text-text/80 leading-relaxed">
                    {result.summary || result.insights || JSON.stringify(result)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setResult(null)}
                className="mt-auto text-sm text-text/50 hover:text-text transition-colors"
              >
                Write another entry →
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="I've been feeling a slight headache since morning..."
                className="flex-1 w-full bg-background/30 border border-white/5 rounded-2xl p-4 text-sm outline-none placeholder:text-text/30 resize-none focus:border-purple-500/30 transition-colors"
              />

              {result?.error && (
                <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                  {result.error}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-text/60">
                  <Mic size={18} />
                </button>
                <button 
                  onClick={submit}
                  disabled={isSubmitting || !entry.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500 text-white font-medium hover:bg-purple-500/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send size={14} />
                      Process
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
