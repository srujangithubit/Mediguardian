"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, File, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../lib/api";

interface UploadRecordModalProps {
  familyMemberId: string;
  onClose: () => void;
}

export function UploadRecordModal({ familyMemberId, onClose }: UploadRecordModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("LAB_REPORT");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.split('.')[0]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.split('.')[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    
    if (!title) {
      setError("Please enter a title for this record");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('familyMemberId', familyMemberId);
      formData.append('title', title);
      formData.append('type', type);

      await api.post('/records/upload', formData);
      
      onClose();
    } catch (err: any) {
      console.error("Upload error", err);
      setError(err.response?.data?.message || "Failed to upload document. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold">Upload Medical Record</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X size={20} className="text-text/60 hover:text-text" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <form id="upload-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div 
              className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-colors flex flex-col items-center justify-center min-h-[200px] cursor-pointer
                ${isDragging ? 'border-accent bg-accent/5' : 'border-white/20 hover:border-accent/50 hover:bg-white/5'}
                ${file ? 'bg-accent/5 border-accent/30' : ''}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileSelect}
                accept=".pdf,.png,.jpg,.jpeg"
              />
              
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 text-accent">
                    <File size={32} />
                  </div>
                  <p className="font-bold text-text line-clamp-1 max-w-[250px]">{file.name}</p>
                  <p className="text-xs text-text/50 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button 
                    type="button" 
                    className="mt-4 text-sm text-accent hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-text/40">
                    <UploadCloud size={32} />
                  </div>
                  <p className="font-bold text-text mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-text/50">PDF, PNG, JPG (max. 10MB)</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-text/70 mb-2">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-text focus:outline-none focus:border-accent transition-colors"
                  placeholder="e.g., Blood Test Results Q2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text/70 mb-2">Document Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-text focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="LAB_REPORT">Lab Report</option>
                  <option value="PRESCRIPTION">Prescription</option>
                  <option value="SCAN">Medical Scan (X-Ray, MRI)</option>
                  <option value="OTHER">Other Document</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <button
            form="upload-form"
            type="submit"
            disabled={isUploading || !file}
            className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-accent text-white font-bold hover:bg-accent-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Uploading...
              </>
            ) : (
              'Save Document'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
