"use client";

import { Edit3, Activity, Heart, ShieldAlert } from "lucide-react";

export function MemberProfile({ name = "Sarah Jenkins", role = "Dependent", age = 12 }) {
  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-[2px]">
            <div className="w-full h-full rounded-2xl border-4 border-card overflow-hidden bg-background">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=transparent" className="w-full h-full opacity-90 object-cover" alt="Profile" />
            </div>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold">{name}</h2>
            <p className="text-sm text-text/60">{role} • {age} years old</p>
          </div>
        </div>
        <button className="p-2 rounded-xl hover:bg-white/5 text-text/40 transition-colors">
          <Edit3 size={18} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
          <Activity size={18} className="text-accent mb-2" />
          <div className="text-xl font-semibold mb-1">Normal</div>
          <div className="text-xs text-text/50">Overall Status</div>
        </div>
        <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
          <Heart size={18} className="text-red-500 mb-2" />
          <div className="text-xl font-semibold mb-1">98 bpm</div>
          <div className="text-xs text-text/50">Avg Heart Rate</div>
        </div>
        <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
          <ShieldAlert size={18} className="text-accent-secondary mb-2" />
          <div className="text-xl font-semibold mb-1">None</div>
          <div className="text-xs text-text/50">Active Alerts</div>
        </div>
      </div>
    </div>
  );
}
