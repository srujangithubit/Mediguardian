"use client";

import { motion } from "framer-motion";
import { Users, Loader2 } from "lucide-react";
import { getInitials } from "@medigaurdian/utils";
import { useAuth } from "../../lib/auth-context";
import { DependentStatusCard } from "./dependent-status-card";
import { useFetch } from "../../hooks/useFetch";

export function CaregiverDashboard() {
  const { familyMembers, selectedMemberId } = useAuth();
  
  // Show all family members except the currently selected one as dependents
  const dependents = familyMembers.filter((m) => m.id !== selectedMemberId);

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Users size={20} className="text-blue-500" />
            Family Overview
          </h2>
          <p className="text-sm text-text/60">Monitor your family members' health.</p>
        </div>
      </div>

      {dependents.length === 0 ? (
        <div className="text-center text-text/40 text-sm py-8 relative z-10">
          <Users size={32} className="mx-auto mb-3 opacity-30" />
          <p>No other family members yet.</p>
          <p className="text-xs mt-1">Add members in Settings to monitor their health.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
          {dependents.map((member, i) => (
            <DependentStatusCard key={member.id} member={member} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
