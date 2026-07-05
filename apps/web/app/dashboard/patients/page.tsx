"use client";

import { useState } from "react";
import { useFetch } from "../../../hooks/useFetch";
import { api } from "../../../lib/api";
import { Users, Plus, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { AddPatientModal } from "../../../components/patients/add-patient-modal";
import { EditPatientModal } from "../../../components/patients/edit-patient-modal";
import { DeletePatientModal } from "../../../components/patients/delete-patient-modal";

export default function PatientsPage() {
  const { families } = useAuth();
  const { data: members, isLoading, error, refetch } = useFetch<any[]>('/families/members');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [deletingMember, setDeletingMember] = useState<any | null>(null);

  // We need to know which family to add dependents to. For now, use the first family they own or belong to.
  const primaryFamilyId = families?.[0]?.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Patients & Dependents</h1>
          <p className="text-text/60 mt-1">Manage family members and care recipients.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          disabled={!primaryFamilyId}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent-secondary transition-colors shadow-lg shadow-accent/20 disabled:opacity-50"
        >
          <Plus size={18} />
          Add Dependent
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500">
          <AlertCircle className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (() => {
        const membersArray = Array.isArray(members) ? members : (members?.data || []);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {membersArray.map((member: any) => (
            <div key={member.id} className="glass rounded-3xl p-6 flex flex-col relative group transition-all hover:bg-white/[0.03]">
              <div className="absolute top-4 right-4 flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                <button 
                  onClick={() => setEditingMember(member)}
                  className="p-2 bg-background/50 hover:bg-white/10 rounded-lg text-text/60 hover:text-text transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setDeletingMember(member)}
                  className="p-2 bg-background/50 hover:bg-red-500/20 rounded-lg text-text/60 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center border border-white/5 shadow-inner">
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full rounded-2xl object-cover" />
                  ) : (
                    <Users className="text-accent w-8 h-8 opacity-70" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{member.fullName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      member.role === 'OWNER' ? 'bg-amber-500/10 text-amber-500' :
                      member.isDependent ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {member.role === 'OWNER' ? 'Account Owner' : member.isDependent ? 'Dependent' : member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                <div>
                  <p className="text-text/40 text-[10px] uppercase font-bold tracking-wider mb-1">Age</p>
                  <p className="font-medium">
                    {member.dateOfBirth ? `${Math.floor((new Date().getTime() - new Date(member.dateOfBirth).getTime()) / 31557600000)} yrs` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-text/40 text-[10px] uppercase font-bold tracking-wider mb-1">Gender</p>
                  <p className="font-medium capitalize">{member.gender?.toLowerCase() || '—'}</p>
                </div>
                <div>
                  <p className="text-text/40 text-[10px] uppercase font-bold tracking-wider mb-1">Blood Group</p>
                  <p className="font-medium">{member.bloodGroup?.replace('_POSITIVE', '+').replace('_NEGATIVE', '-') || '—'}</p>
                </div>
                <div>
                  <p className="text-text/40 text-[10px] uppercase font-bold tracking-wider mb-1">Allergies</p>
                  <p className="font-medium truncate">{member.allergies?.length ? member.allergies.join(', ') : 'None'}</p>
                </div>
              </div>
            </div>
          ))}
          
            {membersArray.length === 0 && (
              <div className="col-span-full py-12 text-center text-text/50">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>No patients found. Add a dependent to get started.</p>
              </div>
            )}
          </div>
        );
      })()}

      {isAddModalOpen && primaryFamilyId && (
        <AddPatientModal 
          familyId={primaryFamilyId} 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            refetch();
          }} 
        />
      )}

      {editingMember && (
        <EditPatientModal 
          member={editingMember} 
          onClose={() => setEditingMember(null)} 
          onSuccess={() => {
            setEditingMember(null);
            refetch();
          }} 
        />
      )}

      {deletingMember && (
        <DeletePatientModal 
          member={deletingMember} 
          onClose={() => setDeletingMember(null)} 
          onSuccess={() => {
            setDeletingMember(null);
            refetch();
          }} 
        />
      )}
    </div>
  );
}
