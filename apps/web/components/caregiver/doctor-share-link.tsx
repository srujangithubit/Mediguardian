"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Copy, Check, Loader2, Clock } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { api } from "../../lib/api";

export function DoctorShareLink() {
  const { selectedMemberId } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState(7);

  const generateLink = async () => {
    if (!selectedMemberId) return;
    setIsGenerating(true);
    try {
      const data = await api.post<{ url?: string; token?: string }>("/share/generate", {
        familyMemberId: selectedMemberId,
        daysValid: expiresIn,
      });
      const generatedUrl = data.url || `${window.location.origin}/shared/${data.token}`;
      setShareLink(generatedUrl);
    } catch (err) {
      console.error("Failed to generate share link:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Link2 size={20} className="text-accent" />
            Share with Doctor
          </h2>
          <p className="text-sm text-text/60">Generate a secure, time-limited link.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-text/40" />
          <span className="text-sm text-text/60">Expires in</span>
          <select 
            value={expiresIn}
            onChange={(e) => setExpiresIn(Number(e.target.value))}
            className="px-2 py-1 rounded-lg bg-background/50 border border-white/10 text-sm outline-none"
          >
            <option value={1}>1 day</option>
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
          </select>
        </div>

        {shareLink ? (
          <div className="p-3 rounded-xl bg-background/50 border border-white/10 flex items-center gap-2">
            <input 
              value={shareLink}
              readOnly
              className="flex-1 bg-transparent text-sm outline-none text-text/80 truncate"
            />
            <motion.button
              onClick={copyToClipboard}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-lg transition-colors ${
                copied ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 hover:bg-white/10 text-text/60"
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </motion.button>
          </div>
        ) : null}

        <button 
          onClick={generateLink}
          disabled={isGenerating || !selectedMemberId}
          className="w-full py-3 rounded-xl bg-accent text-white font-medium flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Link2 size={16} />
              {shareLink ? "Generate New Link" : "Generate Share Link"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
