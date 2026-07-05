import { HeartPulse } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative bg-background selection:bg-accent/30 selection:text-accent">
      {/* Left side - Auth Forms */}
      <div className="flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 lg:py-0 relative z-10">
        <Link href="/" className="absolute top-8 left-8 sm:left-16 md:left-24 flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <HeartPulse size={18} className="stroke-[2.5]" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight">MediGuardian</span>
        </Link>
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>

      {/* Right side - Visual/Premium Graphic */}
      <div className="hidden lg:flex relative overflow-hidden bg-card border-l border-white/5 items-center justify-center">
        {/* Abstract shapes */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-[100px]" />
        
        <div className="relative z-10 p-12 max-w-lg glass rounded-3xl border border-white/10 m-12 backdrop-blur-2xl">
          <div className="flex gap-2 mb-8">
            <div className="w-3 h-3 rounded-full bg-accent/50" />
            <div className="w-3 h-3 rounded-full bg-accent-secondary/50" />
            <div className="w-3 h-3 rounded-full bg-text/20" />
          </div>
          <h2 className="font-heading text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-br from-text to-text/50">
            The intelligent system for modern care.
          </h2>
          <p className="text-text/60 text-lg leading-relaxed">
            Join thousands of providers who have elevated their practice with MediGuardian's predictive engine and ambient intelligence.
          </p>
          
          <div className="mt-12 p-6 rounded-2xl bg-black/20 border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <span className="text-accent font-bold">Dr.</span>
            </div>
            <div>
              <p className="text-text/80 text-sm leading-relaxed italic mb-2">
                "MediGuardian predicted a critical drop in SpO2 for a remote patient 12 hours before it happened. It completely changed how we handle post-op."
              </p>
              <p className="text-xs text-text/40 font-medium tracking-wide uppercase">Sarah Jenkins, MD — Chief of Surgery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
