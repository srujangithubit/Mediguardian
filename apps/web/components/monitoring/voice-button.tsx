"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff } from "lucide-react";
import { useVoiceInput } from "../../hooks/useVoiceInput";
import { useState, useEffect } from "react";

export function VoiceButton() {
  const { isListening, transcript, startListening, stopListening, error } = useVoiceInput();
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (isListening) setShowTranscript(true);
    else {
      const t = setTimeout(() => setShowTranscript(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isListening]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {showTranscript && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-sm p-4 rounded-2xl glass border border-white/10 shadow-2xl text-sm"
          >
            {transcript}
            {isListening && <span className="ml-1 animate-pulse">...</span>}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={isListening ? stopListening : startListening}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-105 active:scale-95 ${
          isListening ? "bg-red-500 text-white" : "bg-accent text-white"
        }`}
      >
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-75" />
            <span className="absolute inset-[-8px] rounded-full bg-red-500/20 animate-pulse" />
          </>
        )}
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
}
