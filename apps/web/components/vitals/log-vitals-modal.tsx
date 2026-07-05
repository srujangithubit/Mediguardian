"use client";

import { useState } from "react";
import { useFetch } from "../../hooks/useFetch";
import { api } from "../../lib/api";
import { X, Loader2, Save } from "lucide-react";

export function LogVitalsModal({ familyMemberId, onClose }: { familyMemberId: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bp' | 'sugar' | 'weight'>('bp');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    try {
      if (activeTab === 'bp') {
        await api.post('/vitals/bp', {
          familyMemberId,
          systolic: parseInt(formData.get("systolic") as string),
          diastolic: parseInt(formData.get("diastolic") as string),
          heartRate: formData.get("heartRate") ? parseInt(formData.get("heartRate") as string) : undefined,
          measurementDate: new Date().toISOString()
        });
      } else if (activeTab === 'sugar') {
        await api.post('/vitals/sugar', {
          familyMemberId,
          glucoseLevel: parseFloat(formData.get("level") as string),
          readingType: formData.get("context") as string,
          measurementDate: new Date().toISOString()
        });
      } else if (activeTab === 'weight') {
        await api.post('/vitals/weight', {
          familyMemberId,
          weightKg: parseFloat(formData.get("weight") as string),
          measurementDate: new Date().toISOString()
        });
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log vitals");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2">Log Vitals</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex border-b border-white/5 bg-black/20">
          <button onClick={() => setActiveTab('bp')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'bp' ? 'text-accent border-b-2 border-accent' : 'text-text/60 hover:text-text'}`}>Blood Pressure</button>
          <button onClick={() => setActiveTab('sugar')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'sugar' ? 'text-accent border-b-2 border-accent' : 'text-text/60 hover:text-text'}`}>Blood Sugar</button>
          <button onClick={() => setActiveTab('weight')} className={`flex-1 py-3 text-sm font-bold ${activeTab === 'weight' ? 'text-accent border-b-2 border-accent' : 'text-text/60 hover:text-text'}`}>Weight</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">{error}</div>}
          
          {activeTab === 'bp' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text/60 mb-1">Systolic (mmHg) *</label>
                <input required name="systolic" type="number" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="120" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text/60 mb-1">Diastolic (mmHg) *</label>
                <input required name="diastolic" type="number" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="80" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-text/60 mb-1">Heart Rate (BPM) (Optional)</label>
                <input name="heartRate" type="number" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="72" />
              </div>
            </div>
          )}

          {activeTab === 'sugar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-text/60 mb-1">Blood Sugar Level (mg/dL) *</label>
                <input required name="level" type="number" step="0.1" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="95" />
              </div>
              <div>
                <label className="block text-xs font-medium text-text/60 mb-1">Context *</label>
                <select name="context" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent appearance-none">
                  <option value="FASTING">Fasting</option>
                  <option value="BEFORE_MEAL">Before Meal</option>
                  <option value="AFTER_MEAL">After Meal</option>
                  <option value="BEDTIME">Bedtime</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'weight' && (
            <div>
              <label className="block text-xs font-medium text-text/60 mb-1">Weight (kg) *</label>
              <input required name="weight" type="number" step="0.1" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="70.5" />
            </div>
          )}

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save size={18} /> Save Entry</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
