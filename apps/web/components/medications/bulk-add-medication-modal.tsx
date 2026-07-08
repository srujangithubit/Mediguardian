"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { X, Loader2, Sparkles, Trash2, Plus } from "lucide-react";

export function BulkAddMedicationModal({ 
  familyMemberId, 
  initialData, 
  onClose, 
  onSuccess 
}: { 
  familyMemberId: string, 
  initialData: any[], 
  onClose: () => void, 
  onSuccess: () => void 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State to hold the list of medications we are about to add
  const [medications, setMedications] = useState<any[]>(
    initialData && initialData.length > 0 ? initialData : [{
      name: "",
      dosage: "",
      dosageUnit: "MG",
      frequency: "ONCE_DAILY",
      schedules: [{ scheduledTime: "09:00" }]
    }]
  );

  const updateMedication = (index: number, field: string, value: any) => {
    const newMeds = [...medications];
    if (field === 'time1') {
      newMeds[index].schedules = [{ scheduledTime: value }];
    } else {
      newMeds[index][field] = value;
    }
    setMedications(newMeds);
  };

  const removeMedication = (index: number) => {
    if (medications.length === 1) return;
    const newMeds = [...medications];
    newMeds.splice(index, 1);
    setMedications(newMeds);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create an array of promises to post each medication
      const promises = medications.map(med => {
        const data = {
          familyMemberId,
          name: med.name,
          dosage: parseFloat(med.dosage) || 0,
          dosageUnit: med.dosageUnit || "MG",
          frequency: med.frequency || "ONCE_DAILY",
          instructions: med.instructions || undefined,
          prescribedBy: med.prescribedBy || undefined,
          startDate: new Date().toISOString(),
          status: "ACTIVE",
          schedules: med.schedules && med.schedules.length > 0 ? med.schedules : [{ scheduledTime: "09:00" }]
        };
        return api.post(`/medications`, data);
      });

      await Promise.all(promises);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to add medications");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass w-full max-w-4xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              Review Extracted Medications
              <span className="bg-accent/20 text-accent text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <Sparkles size={12}/> AI Extracted
              </span>
            </h2>
            <p className="text-text/60 text-sm mt-1">Please review the detected tablets before saving.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20 shrink-0">{error}</div>}
          
          {medications.map((med, idx) => (
            <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl relative group">
              <button 
                onClick={() => removeMedication(idx)}
                className="absolute top-4 right-4 p-2 text-text/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove Medication"
              >
                <Trash2 size={16} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <label className="block text-[10px] uppercase font-bold text-text/60 mb-1">Medication Name</label>
                  <input 
                    value={med.name} 
                    onChange={e => updateMedication(idx, 'name', e.target.value)}
                    required 
                    type="text" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-text/60 mb-1">Dosage</label>
                  <input 
                    value={med.dosage} 
                    onChange={e => updateMedication(idx, 'dosage', e.target.value)}
                    required 
                    type="number" 
                    step="0.01" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent" 
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-text/60 mb-1">Unit</label>
                  <select 
                    value={med.dosageUnit || "MG"} 
                    onChange={e => updateMedication(idx, 'dosageUnit', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent appearance-none"
                  >
                    <option value="MG">mg</option>
                    <option value="ML">ml</option>
                    <option value="TABLET">Tablet(s)</option>
                    <option value="CAPSULE">Capsule(s)</option>
                    <option value="DROPS">Drops</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-text/60 mb-1">Frequency</label>
                  <select 
                    value={med.frequency || "ONCE_DAILY"} 
                    onChange={e => updateMedication(idx, 'frequency', e.target.value)}
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent appearance-none"
                  >
                    <option value="ONCE_DAILY">Once Daily</option>
                    <option value="TWICE_DAILY">Twice Daily</option>
                    <option value="THREE_TIMES_DAILY">Three Times Daily</option>
                    <option value="FOUR_TIMES_DAILY">Four Times Daily</option>
                    <option value="AS_NEEDED">As Needed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-text/60 mb-1">Time</label>
                  <input 
                    value={med.schedules?.[0]?.scheduledTime || "09:00"} 
                    onChange={e => updateMedication(idx, 'time1', e.target.value)}
                    type="time" 
                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-between shrink-0">
          <button
            onClick={() => setMedications([...medications, { name: "", dosage: "", dosageUnit: "MG", frequency: "ONCE_DAILY", schedules: [{ scheduledTime: "09:00" }] }])}
            type="button"
            className="px-4 py-3 rounded-xl font-medium border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Row
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={loading || medications.length === 0} 
            className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-accent text-white rounded-xl font-bold hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? "Saving All..." : `Save All Medications (${medications.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
