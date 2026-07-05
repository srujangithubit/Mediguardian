"use client";

import { useState } from "react";
import { api } from "../../lib/api";
import { X, Loader2, AlertTriangle } from "lucide-react";

export function DeletePatientModal({ member, onClose, onSuccess }: { member: any, onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/families/members/${member.id}`);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass w-full max-w-sm rounded-3xl overflow-hidden border border-red-500/20 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Remove Dependent?</h2>
          <p className="text-text/60 text-sm mb-6">
            Are you sure you want to remove <strong>{member.fullName}</strong>? This action cannot be undone and will delete all their associated health records, medications, and vitals.
          </p>
          
          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">{error}</div>}

          <div className="flex gap-3">
            <button onClick={onClose} disabled={loading} className="flex-1 py-3 rounded-xl border border-white/10 font-medium hover:bg-white/5 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={loading} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex justify-center items-center">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
