"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, FastForward, Activity, Pill, Heart, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

const ICON_MAP: Record<string, any> = {
  med: Pill,
  vital: Activity,
  milestone: Heart,
};

const COLOR_MAP: Record<string, string> = {
  med: "text-accent",
  vital: "text-emerald-500",
  milestone: "text-red-500",
};

export function TimelineReplay() {
  const { selectedMemberId } = useAuth();
  
  // Last 30 days
  const endDate = new Date().toISOString();
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, isLoading } = useFetch<any[]>(
    selectedMemberId
      ? `/analytics/replay?familyMemberId=${selectedMemberId}&startDate=${startDate}&endDate=${endDate}`
      : null
  );

  const eventsArray = Array.isArray(data) ? data : (data?.data || []);
  const events = eventsArray.map((ev: any, i: number) => ({
    id: ev.id || i + 1,
    date: ev.date || new Date(ev.timestamp || ev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    title: ev.title || ev.description,
    type: ev.type || "milestone",
    icon: ICON_MAP[ev.type] || Heart,
    color: COLOR_MAP[ev.type] || "text-purple-500",
  }));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && events.length > 0) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, events.length]);

  const reset = () => {
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <div className="glass rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="glass rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center text-text/40">
          <Heart size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">No health events recorded yet.</p>
          <p className="text-xs mt-1">Start tracking to see your month in review.</p>
        </div>
      </div>
    );
  }

  const currentEvent = events[currentIndex];
  const Icon = currentEvent?.icon || Heart;

  return (
    <div className="glass rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/50 pointer-events-none z-0" />
      
      <div className="w-full flex items-center justify-between absolute top-6 left-6 right-6 z-10 pr-12">
        <h2 className="font-heading text-xl font-bold">Month in Review</h2>
        <div className="flex gap-2">
          {currentIndex >= events.length - 1 && !isPlaying ? (
            <button onClick={reset} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <FastForward size={16} />
            </button>
          ) : (
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-accent text-white shadow-lg shadow-accent/20 transition-transform hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-20 left-6 right-6 h-1 bg-white/5 rounded-full overflow-hidden z-10">
        <motion.div 
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / events.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-12 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
            className="flex flex-col items-center"
          >
            <div className={`w-24 h-24 rounded-full bg-white/5 border border-white/10 shadow-2xl flex items-center justify-center mb-6 relative`}>
              <motion.div 
                className={`absolute inset-0 rounded-full ${currentEvent.color.replace('text', 'bg')}/20`}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Icon size={40} className={`relative z-10 ${currentEvent.color}`} />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-accent font-bold tracking-widest text-xs uppercase mb-2">
                {currentEvent.date}
              </div>
              <h3 className="font-heading text-3xl font-bold text-text mb-4">
                {currentEvent.title}
              </h3>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
