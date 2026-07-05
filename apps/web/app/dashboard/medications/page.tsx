"use client";

import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch";
import { api } from "../../../lib/api";
import { Pill, Plus, Camera, Loader2, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { AddMedicationModal } from "../../../components/medications/add-medication-modal";
import { OcrScannerModal } from "../../../components/medications/ocr-scanner-modal";

export default function MedicationsPage() {
  const { families } = useAuth();
  
  // For Phase 2, we display medications for the primary family member
  // In a real app, there would be a dropdown to select which family member's meds to view.
  const familyMemberId = families?.[0]?.members?.[0]?.id;

  const { data: rawData, isLoading, error, refetch } = useFetch<any[]>(
    familyMemberId ? `/medications?familyMemberId=${familyMemberId}` : null
  );
  
  const medications = Array.isArray(rawData) ? rawData : (rawData?.data || []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedData, setScannedData] = useState<any | null>(null);

  const handleLogAdherence = async (medicationId: string, status: string) => {
    try {
      await api.post(`/medications/${medicationId}/logs`, {
        scheduledTime: new Date().toISOString(),
        status
      });
      // In a full implementation, we'd optimistically update UI or show a toast
      refetch();
    } catch (err) {
      console.error("Failed to log adherence", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
            <Pill className="text-accent" /> Medications
          </h1>
          <p className="text-text/60 mt-1">Manage prescriptions and track adherence.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsScannerOpen(true)}
            disabled={!familyMemberId}
            className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-white/10 text-text rounded-xl font-medium hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <Camera size={18} />
            AI Scan Prescription
          </button>
          <button 
            onClick={() => { setScannedData(null); setIsAddModalOpen(true); }}
            disabled={!familyMemberId}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent-secondary transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            <Plus size={18} />
            Add Medication
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medications.map((med: any) => (
            <div key={med.id} className="glass rounded-3xl p-6 flex flex-col relative group transition-all hover:bg-white/[0.03] border border-white/5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl leading-tight">{med.name}</h3>
                  <p className="text-text/60 text-sm">{med.dosage} {med.dosageUnit}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${med.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-white/10 text-text/60'}`}>
                  {med.status}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <p className="text-text/40 text-[10px] uppercase font-bold tracking-wider mb-1">Frequency</p>
                  <p className="text-sm font-medium">{med.frequency.replace(/_/g, ' ')}</p>
                </div>
                {med.instructions && (
                  <div>
                    <p className="text-text/40 text-[10px] uppercase font-bold tracking-wider mb-1">Instructions</p>
                    <p className="text-sm text-text/80">{med.instructions}</p>
                  </div>
                )}
                {med.schedules && med.schedules.length > 0 && (
                  <div>
                    <p className="text-text/40 text-[10px] uppercase font-bold tracking-wider mb-2">Schedule</p>
                    <div className="flex flex-wrap gap-2">
                      {med.schedules.map((sch: any, idx: number) => (
                        <span key={idx} className="flex items-center gap-1 text-xs bg-black/20 px-2 py-1 rounded-md border border-white/5">
                          <Clock size={12} className="text-accent" /> {sch.scheduledTime}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Adherence Actions */}
              <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleLogAdherence(med.id, 'TAKEN')}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-medium text-sm transition-colors"
                >
                  <CheckCircle2 size={16} /> Taken
                </button>
                <button 
                  onClick={() => handleLogAdherence(med.id, 'MISSED')}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium text-sm transition-colors"
                >
                  <XCircle size={16} /> Missed
                </button>
              </div>
            </div>
          ))}
          
          {medications.length === 0 && (
            <div className="col-span-full py-16 text-center text-text/50 glass rounded-3xl border border-dashed border-white/10">
              <Pill size={48} className="mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-text mb-2">No active medications</h3>
              <p className="max-w-sm mx-auto">Use the AI Scanner to instantly digitize a prescription, or add a medication manually.</p>
            </div>
          )}
        </div>
      )}

      {isScannerOpen && (
        <OcrScannerModal 
          onClose={() => setIsScannerOpen(false)}
          onSuccess={(data) => {
            setScannedData(data);
            setIsScannerOpen(false);
            setIsAddModalOpen(true);
          }}
        />
      )}

      {isAddModalOpen && familyMemberId && (
        <AddMedicationModal 
          familyMemberId={familyMemberId}
          initialData={scannedData}
          onClose={() => {
            setIsAddModalOpen(false);
            setScannedData(null);
          }} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            setScannedData(null);
            refetch();
          }} 
        />
      )}
    </div>
  );
}
