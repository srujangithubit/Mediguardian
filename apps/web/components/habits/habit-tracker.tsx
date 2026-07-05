"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Circle } from "lucide-react";

// Generate 90 days of mock data
const generateHeatmapData = () => {
  const data = [];
  for (let i = 0; i < 90; i++) {
    // 0: none, 1: partial, 2: full
    data.push(Math.floor(Math.random() * 3));
  }
  return data;
};

const HEATMAP_DATA = generateHeatmapData();

export function HabitTracker() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Target size={20} className="text-accent-secondary" />
            Daily Habits
          </h2>
          <p className="text-sm text-text/60">Track your wellness goals.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-accent">14</div>
          <div className="text-[10px] text-text/50 uppercase tracking-wider">Day Streak</div>
        </div>
      </div>

      <div className="mb-8">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => setCompleted(!completed)}
          className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between group ${
            completed 
              ? "bg-accent/10 border-accent/20" 
              : "bg-background/50 border-white/5 hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              completed ? "bg-accent text-white" : "bg-white/5 text-text/40 group-hover:text-text/80"
            }`}>
              {completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </div>
            <div className="text-left">
              <h4 className={`font-medium ${completed ? "text-accent" : ""}`}>Morning Meditation</h4>
              <p className="text-xs text-text/50">15 minutes focused breathing</p>
            </div>
          </div>
          
          <div className={`text-xs font-medium px-3 py-1 rounded-full ${
            completed ? "bg-accent/20 text-accent" : "bg-white/5 text-text/40"
          }`}>
            {completed ? "Completed" : "Pending"}
          </div>
        </motion.button>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-text/50 uppercase tracking-wider mb-3">
          90 Day Activity
        </h4>
        <div className="flex gap-1 overflow-hidden">
          <div className="grid grid-rows-7 grid-flow-col gap-1">
            {HEATMAP_DATA.map((val, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 7) * 0.02 + Math.floor(i / 7) * 0.01 }}
                key={i}
                className={`w-3 h-3 rounded-sm ${
                  val === 2 ? 'bg-accent' : 
                  val === 1 ? 'bg-accent/40' : 
                  'bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-text/40">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-white/5" />
          <div className="w-3 h-3 rounded-sm bg-accent/40" />
          <div className="w-3 h-3 rounded-sm bg-accent" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
