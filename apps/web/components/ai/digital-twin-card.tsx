"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Activity, TrendingUp, ShieldCheck, HeartPulse, Brain, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";
import { api } from "../../lib/api";

export function DigitalTwinCard() {
  const { selectedMemberId } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const { data, isLoading, refetch } = useFetch<any>(
    selectedMemberId ? `/ai/risk-prediction?familyMemberId=${selectedMemberId}` : null
  );

  const handleSync = async () => {
    if (!selectedMemberId) return;
    setIsSyncing(true);
    try {
      await api.post('/ai/digital-twin', { familyMemberId: selectedMemberId });
      await refetch();
    } catch (err) {
      console.error("Failed to sync Digital Twin:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const score = data?.healthScore ?? data?.score ?? 0;
  const risk = data?.riskLevel ?? data?.risk ?? "Unknown";
  const trends = data?.trends || [];
  const recommendations = data?.recommendations || [];

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Brain size={20} className="text-accent" />
            AI Digital Twin
          </h2>
          <p className="text-sm text-text/60">Real-time health assessment.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSync}
            disabled={isSyncing || isLoading}
            className="p-2 rounded-xl bg-accent text-white hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            title="Sync Digital Twin"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
          </button>
          <div className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-xs font-medium flex items-center">
            View Full Scan
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 mb-8">
            <div className="p-6 rounded-2xl bg-background/50 border border-white/5 flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="45" className="stroke-white/10 stroke-[6px] fill-none" />
                  <motion.circle 
                    cx="48" cy="48" r="45" 
                    className="stroke-accent stroke-[6px] fill-none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                    animate={{ strokeDashoffset: 283 - (283 * (score || 0)) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="font-heading text-3xl font-bold">{score || "—"}</span>
                </div>
              </div>
              <h3 className="font-medium">Overall Score</h3>
              <p className="text-xs text-text/50">{score > 0 ? "Based on your health data" : "Add health data to get a score"}</p>
            </div>

            <div className="p-6 rounded-2xl bg-background/50 border border-white/5 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg ${risk === 'LOW' || risk === 'Low' ? 'bg-emerald-500/20 text-emerald-500' : risk === 'MEDIUM' || risk === 'Medium' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
                  {risk === 'LOW' || risk === 'Low' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <div className="text-sm text-text/60">Risk Level</div>
                  <div className={`font-bold ${risk === 'LOW' || risk === 'Low' ? 'text-emerald-500' : risk === 'MEDIUM' || risk === 'Medium' ? 'text-amber-500' : 'text-red-500'}`}>
                    {risk || "Unknown"} Risk
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-text/50 uppercase tracking-wider">Active Trends</h4>
                {trends.length === 0 ? (
                  <p className="text-sm text-text/40">No trends detected yet.</p>
                ) : (
                  trends.map((trend: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <TrendingUp size={14} className="text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-text/80">{typeof trend === "string" ? trend : trend.description || trend.title}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto relative z-10">
            <h4 className="text-xs font-semibold text-text/50 uppercase tracking-wider mb-3">AI Recommendations</h4>
            <div className="space-y-2">
              {recommendations.length === 0 ? (
                <p className="text-sm text-text/40">Add health data to get personalized recommendations.</p>
              ) : (
                recommendations.map((rec: any, i: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                    key={i} 
                    className="p-3 rounded-xl bg-accent/5 border border-accent/10 flex items-start gap-3"
                  >
                    <Activity size={16} className="text-accent mt-0.5 shrink-0" />
                    <p className="text-sm text-text/80 leading-relaxed">{typeof rec === "string" ? rec : rec.text || rec.description}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
