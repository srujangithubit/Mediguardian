"use client";

import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { ShieldAlert, AlertTriangle, Download, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function EmergencyQRCode() {
  const { selectedMemberId, selectedMember } = useAuth();
  const { data, isLoading } = useFetch<any>(
    selectedMemberId ? `/emergency/${selectedMemberId}` : null
  );

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareUrl = data?.shareUrl || `${APP_URL}/emergency/${selectedMemberId}`;
  
  const memberName = data?.fullName || selectedMember?.fullName || "—";
  const bloodGroup = data?.bloodGroup || selectedMember?.bloodGroup || "—";
  const conditions = data?.conditions || data?.activeConditions || [];
  const allergies = data?.allergies || [];
  const medications = data?.activeMedications || data?.medications || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-6 relative overflow-hidden border-red-500/20 border"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <ShieldAlert size={24} className="text-red-500" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold flex items-center gap-2">
                Emergency QR Card
              </h2>
              <p className="text-sm text-text/60">Critical info for first responders.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-text/40" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
                <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Patient</div>
                <div className="font-bold text-lg">{memberName}</div>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
                <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Blood Group</div>
                <div className="font-bold text-lg text-red-500">{bloodGroup}</div>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
                <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Conditions</div>
                <div className="font-medium text-sm">
                  {conditions.length > 0 ? conditions.join(", ") : "None recorded"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-background/50 border border-white/5">
                <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Allergies</div>
                <div className="font-medium text-sm text-amber-500">
                  {allergies.length > 0 ? (
                    <span className="flex items-center gap-1">
                      <AlertTriangle size={14} /> {allergies.join(", ")}
                    </span>
                  ) : "None recorded"}
                </div>
              </div>
              {medications.length > 0 && (
                <div className="p-4 rounded-2xl bg-background/50 border border-white/5 md:col-span-2">
                  <div className="text-xs text-text/50 uppercase tracking-wider mb-1">Active Medications</div>
                  <div className="font-medium text-sm">{medications.map((m: any) => typeof m === "string" ? m : m.name).join(", ")}</div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-center gap-4 lg:border-l lg:border-white/10 lg:pl-8">
          <div className="p-4 rounded-2xl bg-white">
            <QRCodeSVG 
              value={shareUrl}
              size={140}
              fgColor="#000"
              bgColor="#fff"
            />
          </div>
          <p className="text-xs text-text/50 text-center max-w-[180px]">
            Scan for complete emergency profile
          </p>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors">
            <Download size={14} /> Download Card
          </button>
        </div>
      </div>
    </motion.div>
  );
}
