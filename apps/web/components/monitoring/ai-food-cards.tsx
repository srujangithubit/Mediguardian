"use client";

import { motion } from "framer-motion";
import { Utensils, Leaf, Flame, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function AiFoodCards() {
  const { selectedMemberId } = useAuth();
  const { data, isLoading } = useFetch<{ meals?: any[]; recommendations?: any[] }>(
    selectedMemberId ? `/ai/food-recommendations?familyMemberId=${selectedMemberId}` : null
  );

  const recommendations = data?.meals || data?.recommendations || [];

  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <Utensils size={20} className="text-amber-500" />
            AI Dietitian
          </h2>
          <p className="text-sm text-text/60">Personalized meals based on vitals.</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-text/40" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-text/40 text-sm py-8">
            Log some vitals to get personalized food recommendations.
          </div>
        ) : (
          recommendations.map((meal: any, i: number) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={meal.id || i}
              className="p-4 rounded-2xl bg-background/50 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-text/50 uppercase tracking-wider">
                  <Leaf size={14} className="text-emerald-500" />
                  {meal.type || meal.mealType || "Meal"}
                </div>
                {meal.match && (
                  <div className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-md">
                    {meal.match} Match
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-lg mb-1">{meal.title || meal.name}</h3>
              
              <div className="flex items-center gap-4 text-xs text-text/60">
                {meal.cal && (
                  <span className="flex items-center gap-1">
                    <Flame size={12} className="text-orange-500" />
                    {meal.cal} kcal
                  </span>
                )}
                {meal.reason && (
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className="text-emerald-500" />
                    {meal.reason}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
