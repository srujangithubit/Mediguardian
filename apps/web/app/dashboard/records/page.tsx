"use client";

import { useState } from "react";
import { FileText, Plus, Search, File, FileImage, Download, Trash2, ShieldCheck, Microscope, Pill } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { useFetch } from "../../../hooks/useFetch";
import { UploadRecordModal } from "../../../components/records/upload-record-modal";
import { api } from "../../../lib/api";

const TYPE_ICONS: Record<string, any> = {
  LAB_REPORT: Microscope,
  PRESCRIPTION: Pill,
  SCAN: FileImage,
  OTHER: FileText,
};

export default function RecordsPage() {
  const { families } = useAuth();
  const familyMemberId = families?.[0]?.members?.[0]?.id;

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string | null>(null);

  const { data: res, refetch } = useFetch<any>(
    familyMemberId ? `/records?familyMemberId=${familyMemberId}&t=${refreshKey}` : null
  );

  const records = Array.isArray(res) ? res : (res?.data || []);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType ? r.type === filterType : true;
    return matchesSearch && matchesType;
  });

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await api.delete(`/records/${id}`);
        setRefreshKey(prev => prev + 1);
        refetch();
      } catch (err) {
        console.error("Failed to delete record", err);
      }
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-3">
            <ShieldCheck className="text-accent" /> Document Vault
          </h1>
          <p className="text-text/60 mt-1">Securely manage lab reports, prescriptions, and medical scans.</p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!familyMemberId}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent-secondary transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          <Plus size={18} />
          Upload Record
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" size={18} />
          <input 
            type="text" 
            placeholder="Search documents by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/20 border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['ALL', 'LAB_REPORT', 'PRESCRIPTION', 'SCAN', 'OTHER'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type === 'ALL' ? null : type)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                (type === 'ALL' && !filterType) || filterType === type
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-black/20 text-text/60 border border-white/5 hover:bg-white/5'
              }`}
            >
              {type.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/10 rounded-3xl bg-black/20">
          <FileText size={48} className="text-text/20 mb-4" />
          <h3 className="text-xl font-bold mb-2">No Records Found</h3>
          <p className="text-text/60 max-w-sm text-center">
            {searchQuery || filterType 
              ? "Try adjusting your search filters to find what you're looking for."
              : "Upload your first lab report or prescription to keep your medical history secure."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecords.map(record => {
            const Icon = TYPE_ICONS[record.type] || File;
            return (
              <div key={record.id} className="group glass rounded-2xl p-5 border border-white/5 hover:border-accent/50 transition-all hover:-translate-y-1 flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={record.fileUrl} target="_blank" rel="noreferrer" className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded-lg transition-colors" title="Download">
                    <Download size={16} />
                  </a>
                  <button onClick={() => handleDelete(record.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/40 rounded-lg transition-colors" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-accent" />
                </div>
                
                <h3 className="font-bold text-lg mb-1 line-clamp-1 pr-14" title={record.title}>{record.title}</h3>
                <div className="text-xs font-bold text-accent mb-3">{record.type.replace('_', ' ')}</div>
                
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs text-text/50">
                  <span>{new Date(record.recordDate).toLocaleDateString()}</span>
                  <span>{formatFileSize(record.fileSize)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isUploadModalOpen && familyMemberId && (
        <UploadRecordModal 
          familyMemberId={familyMemberId} 
          onClose={() => {
            setIsUploadModalOpen(false);
            setRefreshKey(prev => prev + 1);
            refetch();
          }} 
        />
      )}
    </div>
  );
}
