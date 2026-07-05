"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";
import { useState } from "react";

export function VitalsChart() {
  const { selectedMemberId } = useAuth();
  const [vitalType, setVitalType] = useState<"bp" | "sugar">("bp");
  
  const { data: bpData, isLoading: bpLoading } = useFetch<any[]>(
    selectedMemberId ? `/vitals/bp?familyMemberId=${selectedMemberId}` : null
  );
  const { data: sugarData, isLoading: sugarLoading } = useFetch<any[]>(
    selectedMemberId ? `/vitals/sugar?familyMemberId=${selectedMemberId}` : null
  );

  const isLoading = vitalType === "bp" ? bpLoading : sugarLoading;
  const safeBpData = Array.isArray(bpData) ? bpData : (bpData as any)?.data || [];
  const safeSugarData = Array.isArray(sugarData) ? sugarData : (sugarData as any)?.data || [];

  // Transform data for chart
  const chartData = vitalType === "bp"
    ? (safeBpData).slice(-7).map((log: any) => ({
        time: new Date(log.measuredAt).toLocaleDateString("en-US", { weekday: "short" }),
        systolic: log.systolic,
        diastolic: log.diastolic,
      }))
    : (safeSugarData).slice(-7).map((log: any) => ({
        time: new Date(log.measuredAt).toLocaleDateString("en-US", { weekday: "short" }),
        glucose: log.glucoseLevel,
      }));

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Activity size={20} className="text-accent" />
            Vitals Trend
          </h2>
          <p className="text-sm text-text/60">{vitalType === "bp" ? "Blood Pressure" : "Blood Sugar"} — Last 7 readings</p>
        </div>
        <select
          value={vitalType}
          onChange={(e) => setVitalType(e.target.value as "bp" | "sugar")}
          className="px-3 py-1.5 rounded-lg bg-background/50 border border-white/10 text-xs outline-none"
        >
          <option value="bp">Blood Pressure</option>
          <option value="sugar">Blood Sugar</option>
        </select>
      </div>

      <div className="flex-1 min-h-[250px] -ml-4 relative z-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text/40 text-sm">
            No vitals logged yet. Start tracking to see trends.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSystolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDiastolic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent-secondary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent-secondary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
                dy={10} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(0,0,0,0.8)', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(16px)'
                }}
                itemStyle={{ color: '#fff', fontSize: '14px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
              />
              {vitalType === "bp" ? (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="var(--color-accent)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSystolic)" 
                    animationDuration={1500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="var(--color-accent-secondary)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorDiastolic)" 
                    animationDuration={1500}
                  />
                </>
              ) : (
                <Area 
                  type="monotone" 
                  dataKey="glucose" 
                  stroke="var(--color-accent)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSystolic)" 
                  animationDuration={1500}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
