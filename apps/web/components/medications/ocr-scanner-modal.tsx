"use client";

import { useState, useRef } from "react";
import { api } from "../../lib/api";
import { X, Loader2, Camera, Upload } from "lucide-react";

export function OcrScannerModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (data: any) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const response = await api.post<any>('/medications/ocr', { fileBase64: base64String });
          onSuccess(response);
        } catch (err: any) {
          setError(err.message || "Failed to analyze prescription");
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read the file");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleContainerClick = () => {
    if (!loading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass w-full max-w-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold flex items-center gap-2"><Camera size={20} className="text-accent" /> AI Prescription Scanner</h2>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 text-sm rounded-xl border border-red-500/20">{error}</div>}
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,application/pdf" 
            className="hidden" 
          />
          <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={handleContainerClick}>
            {loading ? (
              <>
                <Loader2 size={48} className="text-accent animate-spin mb-4" />
                <h3 className="font-bold text-lg">AI is analyzing...</h3>
                <p className="text-text/60 text-sm mt-2">Extracting medication name, dosage, and schedules from image.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} className="text-accent" />
                </div>
                <h3 className="font-bold text-lg">Click to Upload Prescription</h3>
                <p className="text-text/60 text-sm mt-2">Upload a photo. Our AI will precisely extract all tablet details, times, and uses.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
