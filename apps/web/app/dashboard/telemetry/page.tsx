"use client";

import { useEffect, useState } from "react";
import { Activity, Heart, Droplet, Plus, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { useFetch } from "../../../hooks/useFetch";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceArea } from "recharts";
import { LogVitalsModal } from "../../../components/vitals/log-vitals-modal";
import { VitalsHistory } from "../../../components/vitals/vitals-history";

export default function VitalsAnalyticsPage() {
  const { families } = useAuth();
  const familyMemberId = families?.[0]?.members?.[0]?.id;

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: summaryRes, refetch: refetchSummary } = useFetch<any>(familyMemberId ? `/vitals/summary?familyMemberId=${familyMemberId}&t=${refreshKey}` : null);
  const { data: bpRes, refetch: refetchBp } = useFetch<any>(familyMemberId ? `/vitals/bp?familyMemberId=${familyMemberId}&t=${refreshKey}` : null);
  const { data: sugarRes, refetch: refetchSugar } = useFetch<any>(familyMemberId ? `/vitals/sugar?familyMemberId=${familyMemberId}&t=${refreshKey}` : null);
  
  const summary = summaryRes?.data || summaryRes;
  const bpLogs = Array.isArray(bpRes) ? bpRes : (bpRes?.data || []);
  const sugarLogs = Array.isArray(sugarRes) ? sugarRes : (sugarRes?.data || []);

  const bpChartData = [...bpLogs].reverse().map(log => ({
    date: new Date(log.measuredAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    systolic: log.systolic,
    diastolic: log.diastolic
  }));

  // Group sugar logs by date for the dual-line chart
  const sugarGroupedByDate = [...sugarLogs].reverse().reduce((acc, log) => {
    const dateStr = new Date(log.measuredAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = { date: dateStr };
    
    // FASTING or BEFORE_MEAL are considered 'beforeMeal'
    if (log.readingType === 'FASTING' || log.readingType === 'BEFORE_MEAL') {
      acc[dateStr].beforeMeal = log.glucoseLevel;
    } 
    // AFTER_MEAL is 'afterMeal'
    else if (log.readingType === 'AFTER_MEAL') {
      acc[dateStr].afterMeal = log.glucoseLevel;
    }
    // BEDTIME can just be mapped to afterMeal or ignored for this specific chart, let's map to afterMeal for visualization
    else if (log.readingType === 'BEDTIME') {
      if (!acc[dateStr].afterMeal) acc[dateStr].afterMeal = log.glucoseLevel;
    }
    
    return acc;
  }, {});

  const sugarChartData = Object.values(sugarGroupedByDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
            <Activity className="text-accent" /> Vitals & Analytics
          </h1>
          <p className="text-text/60 mt-1">Comprehensive historical tracking and clinical threshold alerts.</p>
        </div>
        <button 
          onClick={() => setIsLogModalOpen(true)}
          disabled={!familyMemberId}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent-secondary transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          <Plus size={18} />
          Log Vitals
        </button>
      </div>

      {summary?.bp?.status === 'CRITICAL_HIGH' && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="p-2 bg-red-500/20 rounded-full shrink-0">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <div>
            <h3 className="text-red-500 font-bold text-lg">Hypertensive Crisis Detected</h3>
            <p className="text-red-500/80 text-sm mt-1">Your latest blood pressure reading ({summary.bp.latest.systolic}/{summary.bp.latest.diastolic}) is critically high. Please consult a doctor immediately.</p>
          </div>
        </div>
      )}

      {summary?.bp?.status === 'HIGH' && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-4">
          <div className="p-2 bg-orange-500/20 rounded-full shrink-0">
            <Info className="text-orange-500" size={24} />
          </div>
          <div>
            <h3 className="text-orange-500 font-bold text-lg">Elevated Blood Pressure</h3>
            <p className="text-orange-500/80 text-sm mt-1">Your latest reading indicates elevated blood pressure. Consider monitoring it closely over the next few days.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Insights */}
        <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-text/60 mb-2">
              <Heart size={18} className="text-red-400" />
              <h2 className="font-bold uppercase tracking-wider text-sm">Blood Pressure Avg</h2>
            </div>
            {summary?.bp?.average ? (
              <>
                <span className="text-4xl font-heading font-bold">{summary.bp.average}</span>
                <span className="text-sm text-text/40 ml-2">mmHg (Lifetime)</span>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  {summary.bp.status === 'NORMAL' ? (
                     <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Stable Trend</span>
                  ) : (
                     <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md"><AlertTriangle size={14}/> Action Recommended</span>
                  )}
                  <span className="text-xs text-text/50">{summary.bp.totalReadings} total logs</span>
                </div>
              </>
            ) : (
              <p className="text-text/40 text-sm">No data available.</p>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-text/60 mb-2">
              <Droplet size={18} className="text-blue-400" />
              <h2 className="font-bold uppercase tracking-wider text-sm">Blood Sugar Avg</h2>
            </div>
            {summary?.sugar?.average ? (
              <>
                <span className="text-4xl font-heading font-bold">{summary.sugar.average}</span>
                <span className="text-sm text-text/40 ml-2">mg/dL (Lifetime)</span>
                
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  {summary.sugar.status === 'NORMAL' ? (
                     <span className="flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md"><CheckCircle2 size={14}/> Within Range</span>
                  ) : (
                     <span className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded-md"><AlertTriangle size={14}/> Out of Range</span>
                  )}
                  <span className="text-xs text-text/50">{summary.sugar.totalReadings} total logs</span>
                </div>
              </>
            ) : (
              <p className="text-text/40 text-sm">No data available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Blood Pressure Trends</h2>
            
            {bpChartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bpChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickMargin={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#ffffff40" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <ReferenceArea y1={90} y2={120} fill="#10b981" fillOpacity={0.05} />
                    <Line type="monotone" name="Systolic" dataKey="systolic" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#1a1a1a', strokeWidth: 2 }} />
                    <Line type="monotone" name="Diastolic" dataKey="diastolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1a1a1a', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                <p className="text-text/40">Log your first blood pressure reading to see trends.</p>
              </div>
            )}
          </div>

          <div className="glass rounded-3xl p-6 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Blood Sugar Trends</h2>
            
            {sugarChartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sugarChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="date" stroke="#ffffff40" fontSize={10} tickMargin={10} />
                    <YAxis domain={['auto', 'auto']} stroke="#ffffff40" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#888', marginBottom: '4px' }}
                    />
                    {/* Normal fasting blood sugar is ~70 to 100, up to 140 post-meal. We use 70-140 as a general safe zone */}
                    <ReferenceArea y1={70} y2={140} fill="#10b981" fillOpacity={0.05} />
                    <Line type="monotone" name="Before Meal" dataKey="beforeMeal" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#1a1a1a', strokeWidth: 2 }} connectNulls />
                    <Line type="monotone" name="After Meal" dataKey="afterMeal" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#1a1a1a', strokeWidth: 2 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-2xl">
                <p className="text-text/40">Log your first blood sugar reading to see trends.</p>
              </div>
            )}
          </div>
        </div>

        {/* Historical Vitals List */}
        <div className="lg:col-span-1">
          {familyMemberId && <VitalsHistory key={refreshKey} familyMemberId={familyMemberId} />}
        </div>
      </div>

      {isLogModalOpen && familyMemberId && (
        <LogVitalsModal 
          familyMemberId={familyMemberId} 
          onClose={() => {
            setIsLogModalOpen(false);
            setRefreshKey(prev => prev + 1);
            // We don't even need to call refetch manually because changing refreshKey updates the URL, triggering useEffect inside useFetch!
          }} 
        />
      )}
    </div>
  );
}
