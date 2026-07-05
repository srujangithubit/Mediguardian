"use client";

import { useState } from "react";
import { Pill, Search, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

const MOCK_MEDICATIONS = [
  { id: "1", name: "Lisinopril", dosage: "10mg", frequency: "Daily", status: "Active", time: "08:00 AM" },
  { id: "2", name: "Metformin", dosage: "500mg", frequency: "Twice a day", status: "Active", time: "08:00 AM, 08:00 PM" },
  { id: "3", name: "Amoxicillin", dosage: "250mg", frequency: "Every 8 hours", status: "Completed", time: "As directed" },
  { id: "4", name: "Atorvastatin", dosage: "20mg", frequency: "Daily", status: "Active", time: "09:00 PM" },
];

export function MedicationList() {
  const [filter, setFilter] = useState("Active");
  const [search, setSearch] = useState("");

  const filtered = MOCK_MEDICATIONS.filter(med => 
    (filter === "All" || med.status === filter) &&
    (med.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col h-full min-h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold">Medications</h2>
          <p className="text-sm text-text/60">Manage your active prescriptions.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-48 h-9 pl-9 pr-4 rounded-lg bg-background/50 border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 px-3 rounded-lg bg-background/50 border border-white/10 outline-none text-sm appearance-none cursor-pointer"
          >
            <option>All</option>
            <option>Active</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide space-y-3">
        {filtered.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-text/40 text-sm">
            No medications found.
          </div>
        ) : (
          filtered.map((med, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={med.id}
              className="group flex items-center justify-between p-4 rounded-2xl bg-background/40 hover:bg-white/5 border border-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${med.status === 'Active' ? 'bg-accent/10 text-accent' : 'bg-text/5 text-text/40'}`}>
                  <Pill size={20} />
                </div>
                <div>
                  <h4 className={`font-medium ${med.status === 'Completed' ? 'text-text/60 line-through' : ''}`}>
                    {med.name}
                  </h4>
                  <p className="text-xs text-text/50 mt-0.5">
                    {med.dosage} • {med.frequency}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-medium text-text/70">{med.time}</span>
                  <div className={`text-[10px] uppercase tracking-wider mt-0.5 ${med.status === 'Active' ? 'text-accent' : 'text-text/40'}`}>
                    {med.status}
                  </div>
                </div>
                
                <button className="p-2 rounded-lg hover:bg-white/10 text-text/40 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreVertical size={16} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
