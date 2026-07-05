"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, HeartPulse, ArrowRight, ActivitySquare, Brain, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden selection:bg-accent/30 selection:text-accent">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-background" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent-secondary/10 blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent/20">
              <HeartPulse size={24} className="stroke-[2.5]" />
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-text to-text/60">
              MediGuardian
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text/70">
            <Link href="#features" className="hover:text-text transition-colors">Features</Link>
            <Link href="#platform" className="hover:text-text transition-colors">Platform</Link>
            <Link href="#security" className="hover:text-text transition-colors">Security</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm font-medium hover:text-accent transition-colors">
              Log in
            </Link>
            <Link 
              href="/auth/register" 
              className="group relative px-5 py-2.5 rounded-full bg-text text-background font-medium text-sm overflow-hidden transition-transform hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary opacity-0 group-hover:opacity-10 transition-opacity" />
              <span>Get Started</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
        >
          <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-medium text-text/80">MediGuardian AI 2.0 is now live</span>
          <ChevronRight size={16} className="text-text/50" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] mb-8 max-w-5xl"
        >
          Healthcare intelligence, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent to-accent-secondary">
            reimagined.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-text/60 max-w-2xl mb-12 font-light leading-relaxed"
        >
          The first truly intelligent operating system for modern medical teams. 
          Proactive patient monitoring, AI-driven insights, and military-grade security.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link 
            href="/auth/register"
            className="group relative flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-white font-medium overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(32,201,151,0.3)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative">Start Free Trial</span>
            <ArrowRight size={18} className="relative group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <button className="px-8 py-4 rounded-full glass font-medium hover:bg-white/5 transition-colors">
            Book a Demo
          </button>
        </motion.div>
      </section>

      {/* Feature Showcase (Bento Grid) */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 glass rounded-3xl p-8 md:p-12 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] group-hover:bg-accent/20 transition-colors duration-700" />
            <Brain className="w-12 h-12 text-accent mb-6" />
            <h3 className="font-heading text-3xl font-bold mb-4">Predictive Diagnostics</h3>
            <p className="text-text/60 max-w-md leading-relaxed text-lg mb-8">
              Our proprietary neural network analyzes patient vitals in real-time, 
              detecting subtle anomalies up to 48 hours before critical events occur.
            </p>
            <div className="h-40 rounded-2xl border border-white/10 bg-black/20 flex flex-col justify-end overflow-hidden p-4">
              <div className="flex items-end gap-2 h-24 opacity-60">
                {[40, 65, 45, 80, 55, 90, 70, 100, 60].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: "10%" }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-accent to-accent-secondary rounded-t-sm"
                  />
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden group"
          >
            <ShieldCheck className="w-12 h-12 text-accent-secondary mb-6" />
            <h3 className="font-heading text-2xl font-bold mb-4">HIPAA Native</h3>
            <p className="text-text/60 leading-relaxed">
              Zero-knowledge encryption ensures patient data remains private. You hold the keys, always.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden group"
          >
            <ActivitySquare className="w-12 h-12 text-accent mb-6" />
            <h3 className="font-heading text-2xl font-bold mb-4">Live Telemetry</h3>
            <p className="text-text/60 leading-relaxed">
              Connect to any WHOOP, Apple Watch, or continuous glucose monitor instantly.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 glass rounded-3xl p-8 md:p-12 relative overflow-hidden group"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-secondary/10 rounded-full blur-[80px] group-hover:bg-accent-secondary/20 transition-colors duration-700" />
            <FileText className="w-12 h-12 text-text mb-6" />
            <h3 className="font-heading text-3xl font-bold mb-4">Automated Charting</h3>
            <p className="text-text/60 max-w-md leading-relaxed text-lg">
              Ambient listening securely drafts clinical notes during consultations. 
              Review, edit, and sign in seconds, not hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-text/40 text-sm mt-20">
        <p>© 2026 MediGuardian AI. All rights reserved. Built for modern medicine.</p>
      </footer>
    </div>
  );
}
