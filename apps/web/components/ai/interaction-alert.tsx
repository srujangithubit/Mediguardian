"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, X, ShieldAlert } from "lucide-react";
import { useState } from "react";

export function InteractionAlert() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass rounded-3xl p-5 border border-red-500/20 bg-red-500/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[50px] pointer-events-none" />
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-text/40 hover:text-text/80 hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <ShieldAlert size={20} />
          </div>
          
          <div className="pr-6">
            <h3 className="font-heading font-bold text-red-500 mb-1">High Risk Interaction Detected</h3>
            <p className="text-sm text-text/80 leading-relaxed mb-3">
              <span className="font-semibold text-text">Lisinopril</span> and <span className="font-semibold text-text">Ibuprofen</span> may interact. 
              Taking NSAIDs with ACE inhibitors can decrease the antihypertensive effect and increase the risk of renal impairment.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors shadow-sm shadow-red-500/20">
                Acknowledge Risk
              </button>
              <button className="px-4 py-2 rounded-xl glass text-xs font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-1.5">
                <Info size={14} /> View Clinical Studies
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
