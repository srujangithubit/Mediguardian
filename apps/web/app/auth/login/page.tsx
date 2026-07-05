"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Fingerprint, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
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
        <h1 className="font-heading text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-text/60">Enter your credentials to access the platform.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text/80 block">Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="provider@hospital.org"
            className="w-full h-12 px-4 rounded-xl bg-card border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none placeholder:text-text/20"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-text/80">Password</label>
            <Link href="#" className="text-xs font-medium text-accent hover:text-accent-secondary transition-colors">
              Forgot?
            </Link>
          </div>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full h-12 px-4 rounded-xl bg-card border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none placeholder:text-text/20"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-text text-background font-medium mt-4 flex items-center justify-center gap-2 hover:bg-text/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
        >
          {isLoading ? (
            <div className="w-5 h-5 rounded-full border-2 border-background/20 border-t-background animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-white/10" />
          <span className="shrink-0 px-4 text-xs text-text/40">OR</span>
          <div className="flex-grow border-t border-white/10" />
        </div>

        <button 
          type="button"
          className="w-full h-12 rounded-xl glass hover:bg-white/5 active:scale-[0.98] transition-all font-medium flex items-center justify-center gap-2"
        >
          <Fingerprint size={18} className="text-accent" />
          Sign in with Passkey
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-text/60">
        Don't have an account?{" "}
        <Link href="/auth/register" className="text-accent hover:text-accent-secondary font-medium transition-colors">
          Request access
        </Link>
      </p>
    </motion.div>
  );
}
