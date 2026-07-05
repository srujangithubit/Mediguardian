"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, Brain, Lock, Check } from "lucide-react";

export function PrivacySettings() {
  const [toggles, setToggles] = useState({
    aiAnalysis: true,
    familyAccess: true,
    researchData: false,
    doctorAccess: true,
  });

  const toggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SETTINGS = [
    { key: "aiAnalysis", name: "AI Health Analysis", desc: "Allow MediGuardian AI to analyze your vitals for predictive alerts.", icon: Brain, color: "text-purple-500" },
    { key: "familyAccess", name: "Family Access", desc: "Let approved family members view your general status.", icon: Eye, color: "text-blue-500" },
    { key: "doctorAccess", name: "Primary Care Access", desc: "Allow your linked physician to view detailed metrics.", icon: ShieldCheck, color: "text-emerald-500" },
    { key: "researchData", name: "Anonymized Research", desc: "Contribute anonymous data to medical research.", icon: Lock, color: "text-text/60" },
  ] as const;

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" />
            Privacy & Consent
          </h2>
          <p className="text-sm text-text/60">Manage who sees your data.</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-6 flex items-start gap-3">
        <Lock size={16} className="text-emerald-500 shrink-0 mt-0.5" />
        <p className="text-sm text-text/80 leading-relaxed">
          Your data is <span className="font-semibold text-emerald-500">end-to-end encrypted</span>. Even MediGuardian cannot read your raw medical records without your device's private key.
        </p>
      </div>

      <div className="space-y-4">
        {SETTINGS.map((setting) => (
          <div key={setting.key} className="flex items-start justify-between p-4 rounded-2xl bg-background/50 border border-white/5 hover:bg-white/5 transition-colors">
            <div className="flex gap-4 pr-6">
              <div className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center shrink-0">
                <setting.icon size={18} className={setting.color} />
              </div>
              <div>
                <h3 className="font-bold text-sm mb-1">{setting.name}</h3>
                <p className="text-xs text-text/60 leading-relaxed">{setting.desc}</p>
              </div>
            </div>

            <button 
              onClick={() => toggle(setting.key)}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 mt-2 ${
                toggles[setting.key] ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                animate={{ x: toggles[setting.key] ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {toggles[setting.key] && <Check size={10} className="text-emerald-500" />}
              </motion.div>
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-6 flex justify-end">
        <button className="px-5 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors">
          Delete All Data
        </button>
      </div>
    </div>
  );
}
