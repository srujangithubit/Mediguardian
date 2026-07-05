"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { X, Loader2 } from "lucide-react";

export function EditPatientModal({ member, onClose, onSuccess }: { member: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      dateOfBirth: formData.get("dateOfBirth") ? new Date(formData.get("dateOfBirth") as string).toISOString() : undefined,
      gender: formData.get("gender") || undefined,
      bloodGroup: formData.get("bloodGroup") || undefined,
      allergies: formData.get("allergies") ? (formData.get("allergies") as string).split(',').map(s => s.trim()) : [],
      medicalNotes: formData.get("medicalNotes") || undefined,
    };

    try {
      await api.put(`/families/members/${member.id}`, data);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  const formattedDate = member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold">Edit {member.fullName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">{error}</div>}
          
          <div>
            <label className="block text-xs font-medium text-text/60 mb-1">Full Name *</label>
            <input defaultValue={member.fullName} required name="fullName" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text/60 mb-1">Date of Birth</label>
              <input defaultValue={formattedDate} name="dateOfBirth" type="date" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text/60 mb-1">Gender</label>
              <select defaultValue={member.gender || ""} name="gender" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent appearance-none">
                <option value="">Select...</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text/60 mb-1">Blood Group</label>
              <select defaultValue={member.bloodGroup || ""} name="bloodGroup" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent appearance-none">
                <option value="">Select...</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text/60 mb-1">Allergies (comma separated)</label>
              <input defaultValue={(member.allergies || []).join(', ')} name="allergies" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text/60 mb-1">Medical Notes</label>
            <textarea defaultValue={member.medicalNotes || ''} name="medicalNotes" rows={3} className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent resize-none"></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 font-medium hover:bg-white/5 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50 flex justify-center items-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
