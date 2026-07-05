"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { X, Loader2, Sparkles } from "lucide-react";

export function AddMedicationModal({ familyMemberId, initialData, onClose, onSuccess }: { familyMemberId: string, initialData?: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const schedules = [];
    const time1 = formData.get("time1") as string;
    const time2 = formData.get("time2") as string;
    
    if (time1) schedules.push({ scheduledTime: time1 });
    if (time2) schedules.push({ scheduledTime: time2 });

    const data = {
      familyMemberId,
      name: formData.get("name") as string,
      dosage: parseFloat(formData.get("dosage") as string),
      dosageUnit: formData.get("dosageUnit") as string,
      frequency: formData.get("frequency") as string,
      instructions: formData.get("instructions") as string || undefined,
      prescribedBy: formData.get("prescribedBy") as string || undefined,
      startDate: new Date().toISOString(),
      status: "ACTIVE",
      schedules
    };

    try {
      await api.post(`/medications`, data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add medication");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Add Medication 
            {initialData && <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-md flex items-center gap-1"><Sparkles size={12}/> AI Autofilled</span>}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">{error}</div>}
          
          <div>
            <label className="block text-xs font-medium text-text/60 mb-1">Medication Name *</label>
            <input defaultValue={initialData?.name} required name="name" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="e.g. Lisinopril" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text/60 mb-1">Dosage *</label>
              <input defaultValue={initialData?.dosage} required name="dosage" type="number" step="0.01" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text/60 mb-1">Unit *</label>
              <select defaultValue={initialData?.dosageUnit || "MG"} name="dosageUnit" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent appearance-none">
                <option value="MG">mg</option>
                <option value="ML">ml</option>
                <option value="TABLET">Tablet(s)</option>
                <option value="CAPSULE">Capsule(s)</option>
                <option value="DROPS">Drops</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text/60 mb-1">Frequency *</label>
            <select defaultValue={initialData?.frequency || "ONCE_DAILY"} name="frequency" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent appearance-none">
              <option value="ONCE_DAILY">Once Daily</option>
              <option value="TWICE_DAILY">Twice Daily</option>
              <option value="THREE_TIMES_DAILY">Three Times Daily</option>
              <option value="AS_NEEDED">As Needed</option>
            </select>
          </div>

          <div className="p-4 rounded-xl border border-white/5 bg-black/20 space-y-3">
            <label className="block text-xs font-bold text-text/80">Schedule Times</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase text-text/40 mb-1">Dose 1</label>
                <input defaultValue={initialData?.schedules?.[0]?.scheduledTime || "09:00"} name="time1" type="time" className="w-full bg-background/80 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-[10px] uppercase text-text/40 mb-1">Dose 2 (Optional)</label>
                <input defaultValue={initialData?.schedules?.[1]?.scheduledTime || ""} name="time2" type="time" className="w-full bg-background/80 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text/60 mb-1">Instructions / Meal Relation</label>
            <input defaultValue={initialData?.instructions} name="instructions" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="e.g. Take with food" />
          </div>

          <div>
            <label className="block text-xs font-medium text-text/60 mb-1">Prescribing Doctor</label>
            <input defaultValue={initialData?.prescribedBy} name="prescribedBy" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="e.g. Dr. Smith" />
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-background/80 backdrop-blur-md pb-2 -mb-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50 flex justify-center items-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
