"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Shield, Flame, Heart, Activity, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

const ICON_MAP: Record<string, any> = {
  star: Star,
  heart: Heart,
  flame: Flame,
  shield: Shield,
  activity: Activity,
  trophy: Trophy,
};

const COLOR_MAP: Record<string, { text: string; bg: string }> = {
  amber: { text: "text-amber-500", bg: "bg-amber-500" },
  red: { text: "text-red-500", bg: "bg-red-500" },
  orange: { text: "text-orange-500", bg: "bg-orange-500" },
  indigo: { text: "text-indigo-500", bg: "bg-indigo-500" },
  emerald: { text: "text-emerald-500", bg: "bg-emerald-500" },
  purple: { text: "text-purple-500", bg: "bg-purple-500" },
};

export function AchievementBadges() {
  const { selectedMemberId } = useAuth();
  const { data, isLoading } = useFetch<{ badges: any[] }>(
    selectedMemberId ? `/gamification/badges?familyMemberId=${selectedMemberId}` : null
  );

  const badges = (data?.badges || []).map((badge: any) => ({
    id: badge.id,
    title: badge.title || badge.name,
    desc: badge.desc || badge.description,
    icon: ICON_MAP[badge.icon] || Trophy,
    color: COLOR_MAP[badge.color]?.text || "text-amber-500",
    bg: COLOR_MAP[badge.color]?.bg || "bg-amber-500",
    unlocked: badge.unlocked ?? badge.earned ?? false,
  }));

  return (
    <div className="glass rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            Achievements
          </h2>
          <p className="text-sm text-text/60">Milestones & Streaks</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-5 h-5 animate-spin text-text/40" />
        </div>
      ) : badges.length === 0 ? (
        <div className="flex items-center justify-center flex-1 text-text/40 text-sm text-center">
          <div>
            <Trophy size={32} className="mx-auto mb-3 opacity-30" />
            <p>No badges yet. Start tracking to earn achievements!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 flex-1">
          {badges.map((badge: any, i: number) => {
            const Icon = badge.icon;
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={badge.id || i}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                  badge.unlocked 
                    ? "bg-background/40 border-white/10 hover:bg-white/5 shadow-lg shadow-black/20" 
                    : "bg-background/20 border-white/5 opacity-50 grayscale"
                }`}
              >
                <div className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center relative overflow-hidden ${
                  badge.unlocked ? `${badge.bg}/20 ${badge.color}` : "bg-white/5 text-text/40"
                }`}>
                  {badge.unlocked && (
                    <div className={`absolute inset-0 ${badge.bg} opacity-20 blur-md`} />
                  )}
                  <Icon size={24} className="relative z-10" />
                </div>
                <h4 className="text-xs font-bold mb-1 leading-tight">{badge.title}</h4>
                <p className="text-[9px] text-text/50 leading-tight hidden sm:block">{badge.desc}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
