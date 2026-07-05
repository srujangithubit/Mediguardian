"use client";

import { useFetch } from "../../hooks/useFetch";
import { Activity, Droplet, Scale } from "lucide-react";

export function VitalsHistory({ familyMemberId }: { familyMemberId: string }) {
  const { data: bpRes } = useFetch<any>(`/vitals/bp?familyMemberId=${familyMemberId}`);
  const { data: sugarRes } = useFetch<any>(`/vitals/sugar?familyMemberId=${familyMemberId}`);
  const { data: weightRes } = useFetch<any>(`/vitals/weight?familyMemberId=${familyMemberId}`);

  const bpLogs = Array.isArray(bpRes) ? bpRes : (bpRes?.data || []);
  const sugarLogs = Array.isArray(sugarRes) ? sugarRes : (sugarRes?.data || []);
  const weightLogs = Array.isArray(weightRes) ? weightRes : (weightRes?.data || []);

  const latestBp = bpLogs[0];
  const latestSugar = sugarLogs[0];
  const latestWeight = weightLogs[0];

  return (
    <div className="glass rounded-3xl p-6 border border-white/5 shadow-2xl h-full flex flex-col">
      <h2 className="text-xl font-bold mb-6">Recent Vitals</h2>
      
      <div className="space-y-4 flex-1">
        {/* Blood Pressure Card */}
        <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-text/60">
              <Activity size={16} className="text-red-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Blood Pressure</span>
            </div>
            {latestBp && <span className="text-[10px] text-text/40">{new Date(latestBp.measuredAt).toLocaleDateString()}</span>}
          </div>
          {latestBp ? (
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-heading">{latestBp.systolic}/{latestBp.diastolic}</span>
              <span className="text-xs text-text/40 mb-1">mmHg</span>
            </div>
          ) : (
            <p className="text-sm text-text/40">No entries yet</p>
          )}
        </div>

        {/* Blood Sugar Card */}
        <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-text/60">
              <Droplet size={16} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Blood Sugar</span>
            </div>
            {latestSugar && <span className="text-[10px] text-text/40">{new Date(latestSugar.measuredAt).toLocaleDateString()}</span>}
          </div>
          {latestSugar ? (
            <div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold font-heading">{latestSugar.glucoseLevel}</span>
                <span className="text-xs text-text/40 mb-1">mg/dL</span>
              </div>
              <p className="text-xs text-text/50 mt-1 capitalize">{latestSugar.readingType.replace('_', ' ').toLowerCase()}</p>
            </div>
          ) : (
            <p className="text-sm text-text/40">No entries yet</p>
          )}
        </div>

        {/* Weight Card */}
        <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-text/60">
              <Scale size={16} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Weight</span>
            </div>
            {latestWeight && <span className="text-[10px] text-text/40">{new Date(latestWeight.measuredAt).toLocaleDateString()}</span>}
          </div>
          {latestWeight ? (
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold font-heading">{latestWeight.weightKg}</span>
              <span className="text-xs text-text/40 mb-1">kg</span>
            </div>
          ) : (
            <p className="text-sm text-text/40">No entries yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
