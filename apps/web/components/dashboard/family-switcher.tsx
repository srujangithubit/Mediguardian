"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronsUpDown, Plus, Users } from "lucide-react";
import { getInitials } from "@medigaurdian/utils";
import { useAuth } from "../../lib/auth-context";

const COLORS = ["bg-accent", "bg-blue-500", "bg-purple-500", "bg-amber-500", "bg-emerald-500", "bg-red-500", "bg-indigo-500"];

export function FamilySwitcher() {
  const { familyMembers, selectedMemberId, setSelectedMemberId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const selected = familyMembers.find((m) => m.id === selectedMemberId);

  if (familyMembers.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
      >
        <div className={`w-8 h-8 rounded-full ${COLORS[0]} flex items-center justify-center text-white text-xs font-bold shadow-inner`}>
          {selected ? getInitials(selected.fullName) : "?"}
        </div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-medium leading-none">{selected?.fullName || "Select"}</span>
          <span className="text-[10px] text-text/60 mt-1 uppercase tracking-wider">{selected?.role || ""}</span>
        </div>
        <ChevronsUpDown size={14} className="text-text/40 hidden sm:block ml-2" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 w-64 bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
            >
              <div className="px-2 py-1.5 text-xs font-semibold text-text/40 uppercase tracking-wider">
                Switch Profile
              </div>
              <div className="space-y-1 mt-1">
                {familyMembers.map((member, idx) => (
                  <button
                    key={member.id}
                    onClick={() => {
                      setSelectedMemberId(member.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm transition-colors ${
                      selectedMemberId === member.id ? "bg-accent/10" : "hover:bg-white/5"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${COLORS[idx % COLORS.length]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {getInitials(member.fullName)}
                    </div>
                    <div className="flex flex-col items-start flex-1">
                      <span className={`font-medium ${selectedMemberId === member.id ? "text-accent" : "text-text"}`}>
                        {member.fullName}
                      </span>
                      <span className="text-[10px] text-text/50 uppercase">{member.role}</span>
                    </div>
                    {selectedMemberId === member.id && <Check size={16} className="text-accent" />}
                  </button>
                ))}
              </div>
              
              <div className="h-px bg-white/10 my-2 mx-2" />
              
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors text-text/80">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Plus size={16} />
                </div>
                <span className="font-medium">Add Member</span>
              </button>
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm hover:bg-white/5 transition-colors text-text/80 mt-1">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Users size={16} />
                </div>
                <span className="font-medium">Manage Family</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
