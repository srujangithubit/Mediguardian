"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Upload, Camera, CheckCircle2, AlertCircle } from "lucide-react";

export function MedicineIdentifier() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<null | 'success'>(null);

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult('success');
    }, 3000);
  };

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Scan size={20} className="text-accent-secondary" />
            Pill Identifier
          </h2>
          <p className="text-sm text-text/60">Scan to verify medication.</p>
        </div>
      </div>

      <div className="relative aspect-square md:aspect-video rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex flex-col items-center justify-center">
        
        <AnimatePresence mode="wait">
          {!scanning && !result && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 text-text/40"
            >
              <div className="flex gap-4">
                <button onClick={handleScan} className="p-4 rounded-full bg-white/5 hover:bg-white/10 hover:text-text transition-colors">
                  <Camera size={24} />
                </button>
                <button onClick={handleScan} className="p-4 rounded-full bg-white/5 hover:bg-white/10 hover:text-text transition-colors">
                  <Upload size={24} />
                </button>
              </div>
              <span className="text-sm">Tap to scan or upload</span>
            </motion.div>
          )}

          {scanning && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-48 h-48 border-2 border-accent/30 rounded-3xl relative overflow-hidden">
                <motion.div 
                  className="absolute inset-x-0 h-1 bg-accent shadow-[0_0_20px_rgba(32,201,151,1)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 bg-accent/10 animate-pulse" />
              </div>
              <div className="absolute bottom-6 text-accent text-sm font-medium animate-pulse flex items-center gap-2">
                <Scan size={16} /> Identifying pill...
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-md p-6 flex flex-col justify-center"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl mb-1">Amoxicillin 500mg</h3>
                  <p className="text-sm text-text/60 mb-4">Capsule, Yellow & Opaque. Imprint: AMOX 500</p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text/40 w-16">Class:</span>
                      <span className="text-text/80">Antibiotic (Penicillin)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-text/40 w-16">Match:</span>
                      <span className="text-emerald-500 font-medium">99.8% Confidence</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
                      Add to Cabinet
                    </button>
                    <button onClick={() => setResult(null)} className="px-4 py-2 rounded-xl glass text-sm font-medium hover:bg-white/5 transition-colors">
                      Scan Another
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
