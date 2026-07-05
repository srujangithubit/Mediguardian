"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Heart, Shield, ArrowRight, ArrowLeft } from "lucide-react";

export function FamilyWizard() {
  const [step, setStep] = useState(1);

  return (
    <div className="glass rounded-3xl p-8 max-w-2xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-secondary/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-8">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${step >= i ? "bg-accent" : "bg-white/10"}`} 
            />
          ))}
        </div>
        <span className="text-xs font-medium text-text/40">Step {step} of 3</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">Add a Family Member</h2>
              <p className="text-text/60">Who are you adding to your MediGuardian circle?</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setStep(2)} className="p-6 rounded-2xl border border-white/10 bg-background/50 hover:bg-white/5 hover:border-accent/50 transition-all text-left group">
                <Heart className="text-accent mb-4 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="font-medium mb-1">Dependent</h3>
                <p className="text-xs text-text/50">Manage care for a child or elder.</p>
              </button>
              
              <button onClick={() => setStep(2)} className="p-6 rounded-2xl border border-white/10 bg-background/50 hover:bg-white/5 hover:border-accent-secondary/50 transition-all text-left group">
                <Shield className="text-accent-secondary mb-4 group-hover:scale-110 transition-transform" size={24} />
                <h3 className="font-medium mb-1">Caregiver</h3>
                <p className="text-xs text-text/50">Share access with a partner or nurse.</p>
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="font-heading text-2xl font-bold mb-2">Basic Details</h2>
              <p className="text-text/60">Enter their basic information.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/80">First Name</label>
                  <input type="text" className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text/80">Last Name</label>
                  <input type="text" className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text/80">Date of Birth</label>
                <input type="date" className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 outline-none [color-scheme:dark]" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setStep(1)} className="h-12 px-6 rounded-xl glass hover:bg-white/5 flex items-center gap-2 text-sm font-medium">
                <ArrowLeft size={16} /> Back
              </button>
              <button onClick={() => setStep(3)} className="h-12 flex-1 rounded-xl bg-text text-background hover:bg-text/90 flex items-center justify-center gap-2 text-sm font-medium">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 text-center py-8"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/20 flex items-center justify-center text-accent mb-6">
              <UserPlus size={32} />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-2">Member Added Successfully</h2>
            <p className="text-text/60 max-w-sm mx-auto">
              You can now manage medications, view health timelines, and receive alerts for this family member.
            </p>
            
            <button onClick={() => setStep(1)} className="mt-8 h-12 px-8 rounded-xl bg-accent text-white font-medium hover:bg-accent/90 transition-colors">
              Go to Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
