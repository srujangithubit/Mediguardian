"use client";

import { motion } from "framer-motion";
import { Pill, Check, Clock, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function TodayTimelineCard() {
  const { selectedMemberId } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  
  const { data, isLoading } = useFetch<any[]>(
    selectedMemberId ? `/timeline?familyMemberId=${selectedMemberId}&date=${today}` : null
  );

  const schedule = (data || []).map((item: any) => ({
    id: item.id,
    time: item.time || new Date(item.scheduledTime || item.startDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    name: item.name || item.title,
    dosage: item.dosage || item.details || "",
    status: item.status || "upcoming",
  }));

  const takenCount = schedule.filter((s: any) => s.status === "taken" || s.status === "TAKEN").length;

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            Today's Schedule
          </h2>
          <p className="text-sm text-text/60">Your medication timeline.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center font-bold text-accent shadow-sm border border-white/5">
          {schedule.length > 0 ? `${takenCount}/${schedule.length}` : "0"}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-5 h-5 animate-spin text-text/40" />
        </div>
      ) : schedule.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-text/40 text-sm">
          No medications scheduled for today.
        </div>
      ) : (
        <div className="relative pl-4 space-y-6 before:absolute before:inset-0 before:ml-[1.45rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-white/10 flex-1">
          {schedule.map((item: any, i: number) => {
            const isTaken = item.status === "taken" || item.status === "TAKEN";
            return (
              <motion.div 
                key={item.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative flex items-center gap-4 group"
              >
                <div className={`absolute -left-[1.45rem] w-4 h-4 rounded-full border-2 bg-card ${
                  isTaken ? 'border-accent' : 'border-white/20'
                } flex items-center justify-center shrink-0 -translate-x-1/2 z-10`}>
                  {isTaken && <div className="w-1.5 h-1.5 rounded-full bg-accent" />}
                </div>

                <div className="flex-1 p-3 rounded-2xl bg-background/40 border border-white/5 group-hover:bg-white/5 transition-colors flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-medium text-text/50 mb-0.5">{item.time}</div>
                    <div className={`text-sm font-medium ${isTaken ? 'text-text/70 line-through' : 'text-text'}`}>
                      {item.name}
                    </div>
                    {item.dosage && <div className="text-xs text-text/40">{item.dosage}</div>}
                  </div>
                  
                  {!isTaken ? (
                    <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-accent hover:text-white flex items-center justify-center text-text/40 transition-colors">
                      <Check size={14} />
                    </button>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center text-accent">
                      <Check size={16} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
