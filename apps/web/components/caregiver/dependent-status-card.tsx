"use client";

import { motion } from "framer-motion";
import { Activity, Heart, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { getInitials } from "@medigaurdian/utils";
import { useFetch } from "../../hooks/useFetch";

interface DependentStatusCardProps {
  member: any;
  index: number;
}

export function DependentStatusCard({ member, index }: DependentStatusCardProps) {
  // Fetch real-time AI risk prediction for this specific dependent
  const { data, isLoading } = useFetch<any>(`/ai/risk-prediction?familyMemberId=${member.id}`);

  // Determine actual status based on AI risk level
  const risk = data?.riskLevel ?? data?.risk ?? "Unknown";
  const score = data?.healthScore ?? data?.score ?? null;

  const isLowRisk = risk === 'LOW' || risk === 'Low';
  const isMediumRisk = risk === 'MEDIUM' || risk === 'Medium';
  const isHighRisk = risk === 'HIGH' || risk === 'High';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-2xl bg-background/50 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex flex-col justify-between h-full"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm font-bold shrink-0">
          {getInitials(member.fullName)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm truncate">{member.fullName}</h3>
          <span className="text-[10px] text-text/50 uppercase tracking-wider">{member.role}</span>
        </div>
        
        {/* Status Indicator Dot */}
        {isLoading ? (
          <Loader2 size={14} className="text-accent animate-spin" />
        ) : (
          <div 
            className={`w-2.5 h-2.5 rounded-full ${isLowRisk ? 'bg-emerald-500' : isMediumRisk ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} 
            title={`${risk} Risk`} 
          />
        )}
      </div>

      <div className="flex gap-3 mt-auto">
        <div className="flex-1 p-2 rounded-lg bg-background/80 border border-white/5 text-center flex flex-col items-center justify-center">
          {isLoading ? (
            <Loader2 size={14} className="mx-auto text-text/40 animate-spin mb-1" />
          ) : (
            <Activity size={14} className={`mx-auto mb-1 ${isHighRisk ? 'text-red-500' : isMediumRisk ? 'text-amber-500' : 'text-emerald-500'}`} />
          )}
          <span className="text-[10px] text-text/60 block whitespace-nowrap">
            {isLoading ? "Loading..." : (score ? `Score: ${score}` : "No Data")}
          </span>
        </div>
        
        <div className="flex-1 p-2 rounded-lg bg-background/80 border border-white/5 text-center flex flex-col items-center justify-center">
          {isLoading ? (
            <Loader2 size={14} className="mx-auto text-text/40 animate-spin mb-1" />
          ) : isLowRisk ? (
            <ShieldCheck size={14} className="mx-auto text-emerald-500 mb-1" />
          ) : (
            <AlertTriangle size={14} className={`mx-auto mb-1 ${isHighRisk ? 'text-red-500' : 'text-amber-500'}`} />
          )}
          <span className="text-[10px] text-text/60 block whitespace-nowrap truncate w-full px-1">
            {isLoading ? "..." : (risk !== "Unknown" ? `${risk} Risk` : "Unknown")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
