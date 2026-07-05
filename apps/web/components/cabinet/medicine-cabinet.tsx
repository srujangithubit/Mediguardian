"use client";

import { motion } from "framer-motion";
import { Pill, AlertTriangle, ShieldCheck, Box } from "lucide-react";

const INVENTORY = [
  { id: 1, name: "Ibuprofen", dosage: "200mg", quantity: 45, expiry: "2026-12", status: "good", color: "bg-emerald-500" },
  { id: 2, name: "Amoxicillin", dosage: "500mg", quantity: 8, expiry: "2026-08", status: "low", color: "bg-amber-500" },
  { id: 3, name: "EpiPen", dosage: "0.3mg", quantity: 1, expiry: "2026-07", status: "expiring", color: "bg-red-500" },
  { id: 4, name: "Vitamin D3", dosage: "1000 IU", quantity: 90, expiry: "2027-01", status: "good", color: "bg-blue-500" },
  { id: 5, name: "Loratadine", dosage: "10mg", quantity: 20, expiry: "2027-05", status: "good", color: "bg-purple-500" },
];

export function MedicineCabinet() {
  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Box size={20} className="text-accent" />
            Home Cabinet
          </h2>
          <p className="text-sm text-text/60">Inventory & expiry tracking.</p>
        </div>
        <button className="text-xs font-medium text-accent hover:text-accent-secondary transition-colors">
          Manage Inventory
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {INVENTORY.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            key={item.id}
            className="group relative rounded-2xl bg-background/50 border border-white/5 p-4 hover:bg-white/5 transition-colors flex flex-col items-center text-center cursor-pointer overflow-hidden"
          >
            {item.status === 'expiring' && (
              <div className="absolute top-0 right-0 w-8 h-8 bg-red-500/20 rounded-bl-xl flex items-center justify-center">
                <AlertTriangle size={14} className="text-red-500" />
              </div>
            )}
            
            <div className={`w-12 h-12 rounded-full ${item.color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Pill size={20} className={`text-${item.color.split('-')[1]}-500`} />
            </div>
            
            <h4 className="font-medium text-sm mb-1 truncate w-full">{item.name}</h4>
            <div className="text-[10px] text-text/50 mb-3">{item.dosage}</div>
            
            <div className="w-full flex items-center justify-between mt-auto">
              <span className="text-xs font-semibold">{item.quantity} left</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                item.status === 'expiring' ? 'bg-red-500/20 text-red-500' :
                item.status === 'low' ? 'bg-amber-500/20 text-amber-500' :
                'bg-emerald-500/20 text-emerald-500'
              }`}>
                {item.expiry.split('-')[1]}/{item.expiry.split('-')[0].slice(2)}
              </span>
            </div>
          </motion.div>
        ))}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-dashed border-white/20 hover:bg-white/5 transition-colors flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px] text-text/40 hover:text-text/80"
        >
          <Box size={24} className="mb-2" />
          <span className="text-xs font-medium">Add to Cabinet</span>
        </motion.div>
      </div>
    </div>
  );
}
