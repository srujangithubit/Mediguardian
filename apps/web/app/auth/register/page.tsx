"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await register(fullName, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-medium mb-4">
          <ShieldCheck size={14} />
          HIPAA Compliant Onboarding
        </div>
        <h1 className="font-heading text-3xl font-bold mb-2">Create Account</h1>
        <p className="text-text/60">Join MediGuardian and start tracking your health.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80 block">First Name</label>
            <input 
              type="text" 
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-card border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80 block">Last Name</label>
            <input 
              type="text" 
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-card border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text/80 block">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full h-12 px-4 rounded-xl bg-card border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none placeholder:text-text/20"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/80 block">Password</label>
          <input 
            type="password" 
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            className="w-full h-12 px-4 rounded-xl bg-card border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none placeholder:text-text/20"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-accent text-white font-medium mt-6 flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none shadow-[0_0_20px_rgba(32,201,151,0.2)]"
        >
          {isLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : (
            <>
              Create Account
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-text hover:text-accent font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
