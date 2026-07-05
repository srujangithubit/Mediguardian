"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { format, addDays, startOfWeek, subDays, endOfWeek } from "date-fns";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function HealthCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { selectedFamilyId } = useAuth();
  
  const start = startOfWeek(currentDate);
  const end = endOfWeek(currentDate);
  
  const { data: events, isLoading } = useFetch<any[]>(
    selectedFamilyId
      ? `/calendar?familyId=${selectedFamilyId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      : null
  );

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <CalendarIcon size={20} className="text-purple-500" />
            Health Calendar
          </h2>
          <p className="text-sm text-text/60">{format(currentDate, "MMMM yyyy")}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentDate(subDays(currentDate, 7))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs font-medium"
          >
            Today
          </button>
          <button 
            onClick={() => setCurrentDate(addDays(currentDate, 7))}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center">
            <div className="text-[10px] font-semibold text-text/40 uppercase tracking-wider mb-2">
              {format(day, "EEE")}
            </div>
            <button className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                ? "bg-accent text-white shadow-lg shadow-accent/20"
                : "hover:bg-white/10"
            }`}>
              {format(day, "d")}
            </button>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 mt-4 scrollbar-hide">
        <h3 className="text-xs font-semibold text-text/50 uppercase tracking-wider sticky top-0 bg-card/80 backdrop-blur-md py-2 z-10">
          Upcoming Events
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-text/40" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center text-text/40 text-sm py-8">
            No events this week.
          </div>
        ) : (
          events.map((event: any, i: number) => {
            const dateStr = event.startDate || event.appointmentDate;
            const validDate = dateStr ? new Date(dateStr) : null;
            const isValidDate = validDate && !isNaN(validDate.getTime());
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={event.id || `event-${i}`}
                className="group flex gap-3 p-3 rounded-2xl bg-background/50 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className={`w-1.5 rounded-full`} style={{ backgroundColor: event.color || "#3B82F6" }} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{event.title}</h4>
                  <p className="text-xs text-text/50 mt-0.5">
                    {event.time || (isValidDate ? format(validDate!, "h:mm a") : "Time TBD")} 
                    {isValidDate ? ` • ${format(validDate!, "MMM d")}` : ""}
                  </p>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-accent hover:text-white flex items-center justify-center text-text/40 transition-colors opacity-0 group-hover:opacity-100">
                  <Check size={14} />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
