"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Watch, Smartphone, Activity, Check, RefreshCw } from "lucide-react";

const DEVICES = [
  { id: "apple", name: "Apple Health", desc: "Sync steps, sleep, and HR", icon: Smartphone, color: "text-blue-500", connected: true },
  { id: "whoop", name: "WHOOP Strap", desc: "Strain and recovery metrics", icon: Watch, color: "text-text", connected: false },
  { id: "fitbit", name: "Fitbit", desc: "Activity and sleep tracking", icon: Activity, color: "text-emerald-500", connected: false },
];

export function WearablesSettings() {
  const [devices, setDevices] = useState(DEVICES);

  const toggleConnection = (id: string) => {
    setDevices(devices.map(d => {
      if (d.id === id) return { ...d, connected: !d.connected };
      return d;
    }));
  };

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Watch size={20} className="text-blue-500" />
            Connected Devices
          </h2>
          <p className="text-sm text-text/60">Manage wearables and health data sources.</p>
        </div>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-text/80">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {devices.map((device) => (
          <div key={device.id} className="p-4 rounded-2xl bg-background/50 border border-white/5 flex items-center justify-between group hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-card border border-white/5 flex items-center justify-center shadow-sm">
                <device.icon size={24} className={device.color} />
              </div>
              <div>
                <h3 className="font-bold text-sm">{device.name}</h3>
                <p className="text-xs text-text/50">{device.desc}</p>
              </div>
            </div>

            <button 
              onClick={() => toggleConnection(device.id)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                device.connected ? "bg-emerald-500" : "bg-white/10"
              }`}
            >
              <motion.div
                className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                animate={{ x: device.connected ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                {device.connected && <Check size={10} className="text-emerald-500" />}
              </motion.div>
            </button>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-3 rounded-xl border border-dashed border-white/20 text-sm font-medium text-text/60 hover:text-text hover:border-white/40 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
        <Activity size={16} /> Connect New Device
      </button>
    </div>
  );
}
