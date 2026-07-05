"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, ShieldAlert, Zap, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function RiskDashboard() {
  const { selectedMemberId } = useAuth();
  const { data, isLoading } = useFetch<any>(
    selectedMemberId ? `/ai/risk-prediction?familyMemberId=${selectedMemberId}` : null
  );

  const riskPercentage = data?.overallRisk ?? data?.riskPercentage ?? 0;
  const primaryFactor = data?.primaryFactor || "No data";
  const contributing = data?.contributingFactor || data?.contributing || "—";
  const mitigation = data?.mitigation || "—";
  const chartData = data?.history || data?.chartData || [];

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex justify-between items-start mb-8 relative z-10">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Zap size={20} className="text-red-500" />
            AI Risk Prediction
          </h2>
          <p className="text-sm text-text/60">30-day cardiovascular event probability</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
          <AlertTriangle size={16} /> {riskPercentage}% Risk
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-6 h-6 animate-spin text-text/40" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative z-10">
            <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
              <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Primary Factor</div>
              <div className="font-medium text-amber-500 flex items-center gap-2">
                {primaryFactor} <TrendingUp size={14} />
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
              <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Contributing</div>
              <div className="font-medium text-text">{contributing}</div>
            </div>
            <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
              <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Mitigation</div>
              <div className="font-medium text-emerald-500 flex items-center gap-2">
                <ShieldAlert size={14} /> {mitigation}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-[200px] relative z-10 -ml-6">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-text/40 text-sm">
                Not enough data for risk trend chart yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} dx={10} />
                  <Area 
                    type="monotone" 
                    dataKey="probability" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRisk)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
