"use client";

import { motion } from "framer-motion";
import { Activity, HeartPulse, Pill, Droplets, Moon } from "lucide-react";
import { format } from "date-fns";

const TIMELINE_EVENTS = [
  { id: "1", type: "vitals", title: "Heart Rate Spike", desc: "124 BPM detected during rest.", time: new Date(Date.now() - 1000 * 60 * 30), icon: HeartPulse, color: "text-red-500", bg: "bg-red-500/10" },
  { id: "2", type: "medication", title: "Medication Taken", desc: "Lisinopril 10mg", time: new Date(Date.now() - 1000 * 60 * 60 * 2), icon: Pill, color: "text-accent", bg: "bg-accent/10" },
  { id: "3", type: "vitals", title: "Blood Pressure Reading", desc: "118/75 mmHg - Normal range.", time: new Date(Date.now() - 1000 * 60 * 60 * 5), icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "4", type: "sleep", title: "Sleep Analysis", desc: "7h 24m total sleep. 2h Deep Sleep.", time: new Date(Date.now() - 1000 * 60 * 60 * 12), icon: Moon, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "5", type: "hydration", title: "Hydration Goal Met", desc: "2.5L consumed today.", time: new Date(Date.now() - 1000 * 60 * 60 * 24), icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500/10" },
];

export function HealthTimeline() {
  return (
    <div className="glass rounded-3xl p-6 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-xl font-bold">Health Timeline</h2>
          <p className="text-sm text-text/60">Chronological history of events.</p>
        </div>
        <button className="text-xs font-medium text-accent hover:text-accent-secondary transition-colors">
          View All
        </button>
      </div>

      <div className="relative pl-4 space-y-8 before:absolute before:inset-0 before:ml-[1.7rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {TIMELINE_EVENTS.map((event, i) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            key={event.id}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-card bg-card shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${event.color}`}>
              <div className={`w-full h-full rounded-full flex items-center justify-center ${event.bg}`}>
                <event.icon size={16} />
              </div>
            </div>
            
            {/* Card */}
            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl glass border border-white/5 group-hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm text-text">{event.title}</h4>
                <time className="text-[10px] font-medium text-text/40">{format(event.time, 'h:mm a')}</time>
              </div>
              <p className="text-xs text-text/60">{event.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
