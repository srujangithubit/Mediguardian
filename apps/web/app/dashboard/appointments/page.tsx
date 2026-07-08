"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Plus, Video, MapPin, Clock, CalendarCheck2, XCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { useFetch } from "../../../hooks/useFetch";
import { AddAppointmentModal } from "../../../components/appointments/add-appointment-modal";
import { api } from "../../../lib/api";

export default function AppointmentsPage() {
  const { families } = useAuth();
  const familyMemberId = families?.[0]?.members?.[0]?.id;

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [googlePopup, setGooglePopup] = useState<'success' | 'error' | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const status = searchParams.get('google');
    if (status === 'success' || status === 'error') {
      setGooglePopup(status);
      // Remove query param to prevent showing it again on refresh
      router.replace('/dashboard/appointments', { scroll: false });
    }
  }, [searchParams, router]);

  const { data: res, refetch } = useFetch<any>(
    familyMemberId ? `/appointments?familyMemberId=${familyMemberId}&t=${refreshKey}` : null
  );

  const appointments = Array.isArray(res) ? res : (res?.data || []);

  const upcoming = appointments.filter(a => a.status === 'SCHEDULED');
  const pastOrCancelled = appointments.filter(a => a.status !== 'SCHEDULED');

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      setRefreshKey(prev => prev + 1);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
            <CalendarIcon className="text-accent" /> Appointments
          </h1>
          <p className="text-text/60 mt-1">Manage doctor visits, telehealth calls, and medical events.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              try {
                const res = await api.get<{ url: string }>('/google/auth-url');
                window.location.href = res.url;
              } catch (err) {
                console.error("Failed to fetch Google auth url", err);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-background/50 border border-white/10 text-text rounded-xl font-medium hover:bg-white/5 transition-colors"
          >
            <CalendarIcon size={18} />
            Connect Google Calendar
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            disabled={!familyMemberId}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent-secondary transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
          >
            <Plus size={18} />
            Schedule Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CalendarCheck2 className="text-emerald-400" size={20} /> Upcoming
            </h2>

            {upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
                <CalendarIcon size={48} className="text-text/20 mb-4" />
                <p className="text-text/60">No upcoming appointments scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map(apt => (
                  <div key={apt.id} className="bg-black/20 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 relative overflow-hidden group hover:border-accent/50 transition-colors">
                    {apt.isOnline && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-bl-xl flex items-center gap-1">
                        <Video size={12} /> TELEHEALTH
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center justify-center bg-white/5 rounded-xl p-3 min-w-[80px]">
                      <span className="text-xs text-text/50 font-bold uppercase">{new Date(apt.appointmentDate).toLocaleDateString([], { month: 'short' })}</span>
                      <span className="text-2xl font-heading font-bold">{new Date(apt.appointmentDate).getDate()}</span>
                      <span className="text-xs text-text/40">{new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{apt.reason || 'General Checkup'}</h3>
                      <p className="text-accent font-medium text-sm mt-1">Dr. {apt.doctorName} {apt.specialization && `• ${apt.specialization}`}</p>
                      
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-text/60">
                        {!apt.isOnline && apt.hospitalName && (
                          <div className="flex items-center gap-1"><MapPin size={14} className="text-text/40" /> {apt.hospitalName}</div>
                        )}
                        {apt.duration && (
                          <div className="flex items-center gap-1"><Clock size={14} className="text-text/40" /> {apt.duration} mins</div>
                        )}
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 justify-center sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      {apt.isOnline && apt.meetingLink && (
                        <a href={apt.meetingLink} target="_blank" rel="noreferrer" className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg text-center flex items-center justify-center gap-1">
                          <Video size={14} /> Join
                        </a>
                      )}
                      <button onClick={() => handleStatusUpdate(apt.id, 'COMPLETED')} className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg text-center border border-emerald-500/20">
                        Mark Done
                      </button>
                      <button onClick={() => handleStatusUpdate(apt.id, 'CANCELLED')} className="px-3 py-2 hover:bg-white/10 text-text/60 text-xs font-bold rounded-lg text-center transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mini Calendar & Past */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass rounded-3xl p-6 border border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Past & Cancelled</h2>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {pastOrCancelled.length === 0 ? (
                <p className="text-text/40 text-sm text-center py-4">No history found.</p>
              ) : (
                pastOrCancelled.map(apt => (
                  <div key={apt.id} className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                    <div className={`p-2 rounded-full ${apt.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {apt.status === 'COMPLETED' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm line-clamp-1">Dr. {apt.doctorName}</h4>
                      <p className="text-xs text-text/50">{new Date(apt.appointmentDate).toLocaleDateString()} • {apt.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {isAddModalOpen && (
        <AddAppointmentModal
          familyMemberId={familyMemberId!}
          onClose={() => setIsAddModalOpen(false)}
          onAdded={() => {
            setIsAddModalOpen(false);
            setRefreshKey(prev => prev + 1);
            refetch();
          }}
        />
      )}

      {googlePopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1a1a24] border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setGooglePopup(null)} className="absolute top-4 right-4 text-text/50 hover:text-white transition-colors">
              <XCircle size={20} />
            </button>
            <div className="flex flex-col items-center text-center mt-4">
              {googlePopup === 'success' ? (
                <>
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Connected!</h2>
                  <p className="text-text/70 mb-6">Your Google Calendar is now synced with Mediguardian.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
                    <XCircle size={32} />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Connection Failed</h2>
                  <p className="text-text/70 mb-6">We couldn't connect to Google Calendar. Please try again.</p>
                </>
              )}
              <button 
                onClick={() => setGooglePopup(null)}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
