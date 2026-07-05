"use client";

import { useState } from "react";
import { X, Loader2, Calendar as CalendarIcon, Video, MapPin, Stethoscope } from "lucide-react";
import { api } from "../../lib/api";

export function AddAppointmentModal({ familyMemberId, onClose }: { familyMemberId: string, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Combine date and time
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string;
    const appointmentDate = new Date(`${dateStr}T${timeStr}`).toISOString();

    const payload = {
      familyMemberId,
      doctorName: formData.get("doctorName"),
      specialization: formData.get("specialization") || undefined,
      appointmentDate,
      duration: parseInt(formData.get("duration") as string) || 30,
      reason: formData.get("reason") || undefined,
      isOnline,
      hospitalName: isOnline ? undefined : (formData.get("hospitalName") || undefined),
      meetingLink: isOnline ? (formData.get("meetingLink") || undefined) : undefined,
    };
    
    try {
      await api.post('/appointments', payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to schedule appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
      <div className="glass w-full max-w-lg rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto mt-10 mb-10">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="text-accent" size={20} /> Schedule Appointment
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-text/60 mb-1">Doctor Name *</label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" size={16} />
                <input required name="doctorName" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="Jane Doe" />
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-text/60 mb-1">Specialization</label>
              <input name="specialization" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="Cardiologist" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-3 sm:col-span-2">
              <label className="block text-xs font-medium text-text/60 mb-1">Date *</label>
              <input required name="date" type="date" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent custom-date-input" />
            </div>
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs font-medium text-text/60 mb-1">Time *</label>
              <input required name="time" type="time" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent custom-time-input" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text/60 mb-1">Reason for Visit</label>
            <input name="reason" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="Routine checkup, feeling unwell..." />
          </div>

          <div className="pt-2">
            <label className="block text-xs font-medium text-text/60 mb-2">Appointment Type</label>
            <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
              <button 
                type="button" 
                onClick={() => setIsOnline(false)} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${!isOnline ? 'bg-white/10 text-white' : 'text-text/60 hover:text-white'}`}
              >
                <MapPin size={16} /> In-Person
              </button>
              <button 
                type="button" 
                onClick={() => setIsOnline(true)} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-colors ${isOnline ? 'bg-blue-500/20 text-blue-400' : 'text-text/60 hover:text-white'}`}
              >
                <Video size={16} /> Telehealth
              </button>
            </div>
          </div>

          {isOnline ? (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-text/60 mb-1">Meeting Link (Zoom, Meet, etc.)</label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" size={16} />
                <input name="meetingLink" type="url" className="w-full bg-background/50 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="https://zoom.us/j/..." />
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-medium text-text/60 mb-1">Hospital / Clinic Name</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-text/40" size={16} />
                <input name="hospitalName" type="text" className="w-full bg-background/50 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-accent" placeholder="General Hospital" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/5 flex gap-3">
            <button type="button" onClick={onClose} className="w-1/3 py-3 rounded-xl bg-white/5 text-text/80 font-medium hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="w-2/3 py-3 rounded-xl bg-accent text-white font-medium hover:bg-accent-secondary transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
