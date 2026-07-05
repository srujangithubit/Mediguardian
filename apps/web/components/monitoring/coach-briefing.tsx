"use client";

import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, ArrowRight, Loader2 } from "lucide-react";
import { getTimeOfDay } from "@medigaurdian/utils";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function CoachBriefing() {
  const [mounted, setMounted] = useState(false);
  const { selectedMemberId } = useAuth();
  useEffect(() => setMounted(true), []);

  const time = mounted ? getTimeOfDay() : "morning";
  const isMorning = time === "morning" || time === "afternoon";
  const timeOfDay = isMorning ? "morning" : "evening";

  const { data, isLoading } = useFetch<{ title: string; summary: string; tips: string[] }>(
    selectedMemberId ? `/ai/coach/briefing?familyMemberId=${selectedMemberId}&timeOfDay=${timeOfDay}` : null
  );

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 md:p-8 ${
      isMorning ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-orange-500/10' : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border-purple-500/10'
    } border backdrop-blur-xl`}>
      <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none ${
        isMorning ? 'bg-amber-500/20' : 'bg-indigo-500/20'
      }`} />

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Sparkles size={16} className={isMorning ? 'text-amber-500' : 'text-indigo-400'} />
        <span className={`text-xs font-bold uppercase tracking-wider ${isMorning ? 'text-amber-500' : 'text-indigo-400'}`}>
          {isMorning ? 'Morning Briefing' : 'Evening Review'}
        </span>
      </div>

      <div className="flex items-start justify-between relative z-10 gap-6">
        <div>
          {isLoading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 animate-spin text-text/40" />
              <span className="text-text/50 text-sm">Generating your briefing...</span>
            </div>
          ) : (
            <>
              <h2 className="font-heading text-2xl font-bold mb-2">
                {data?.title || (isMorning ? "Ready for a great day?" : "Time to wind down.")}
              </h2>
              <p className="text-text/70 leading-relaxed max-w-xl mb-6">
                {data?.summary || "No briefing data available yet. Start tracking your health to get personalized insights."}
              </p>
            </>
          )}
          <button className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-transform hover:scale-105 active:scale-95 ${
            isMorning ? 'bg-amber-500 text-white' : 'bg-indigo-500 text-white'
          }`}>
            View Full Report <ArrowRight size={16} />
          </button>
        </div>
        <div className={`hidden sm:flex w-16 h-16 rounded-full items-center justify-center shrink-0 shadow-lg ${
          isMorning ? 'bg-amber-500/20 text-amber-500' : 'bg-indigo-500/20 text-indigo-400'
        }`}>
          {isMorning ? <Sun size={32} /> : <Moon size={32} />}
        </div>
      </div>
    </div>
  );
}
