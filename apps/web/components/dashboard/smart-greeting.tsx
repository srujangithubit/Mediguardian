"use client";

import { motion } from "framer-motion";
import { getTimeOfDay, getGreeting, getTimeIcon } from "@medigaurdian/utils";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";

export function SmartGreeting() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const name = user?.fullName || "there";

  // Safe fallback while hydrating
  const greeting = mounted ? getGreeting(name) : `Welcome, ${name}`;
  const time = mounted ? getTimeOfDay() : "day";
  const icon = mounted ? getTimeIcon() : "👋";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-1">
        <span className="text-2xl">{icon}</span>
        <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-text to-text/70">
          {greeting}
        </h1>
      </div>
      <p className="text-text/60 text-lg">
        Here's what's happening with your health this {time}.
      </p>
    </motion.div>
  );
}
