"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HeartPulse, 
  LayoutDashboard, 
  Users, 
  Activity, 
  Settings, 
  Calendar,
  MessageSquare,
  FileText,
  X,
  Pill
} from "lucide-react";
import { useEffect } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Medications", href: "/dashboard/medications", icon: Pill },
  { name: "Telemetry", href: "/dashboard/telemetry", icon: Activity },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Messages", href: "/dashboard/messages", icon: MessageSquare },
  { name: "Records", href: "/dashboard/records", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (val: boolean) => void;
}) {
  const pathname = usePathname();

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border-r border-white/5 relative z-20">
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex items-center justify-center text-white shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform">
            <HeartPulse size={18} className="stroke-[2.5]" />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text to-text/60">
            MediGuardian
          </span>
        </Link>
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-text/60 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          // Check exact match for dashboard, startswith for others
          const isActive = item.href === "/dashboard" 
            ? pathname === item.href 
            : pathname.startsWith(item.href);
            
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "text-accent font-medium bg-accent/10" 
                  : "text-text/60 hover:text-text hover:bg-white/5"
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-full" 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
              <item.icon size={20} className={isActive ? "text-accent" : "text-text/50 group-hover:text-text/80 transition-colors"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 shrink-0">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent-secondary/10 border border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent-secondary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
          <h4 className="text-sm font-medium mb-1">MediGuardian Pro</h4>
          <p className="text-xs text-text/60 mb-3 leading-relaxed">Predictive alerts & advanced analytics.</p>
          <button className="w-full py-2 rounded-xl bg-text text-background text-xs font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 lg:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
