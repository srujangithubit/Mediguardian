"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Plus, Pill, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const medicationSchema = z.object({
  name: z.string().min(2, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

export function AddMedicationForm() {
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "daily",
      time: "",
      notes: "",
    },
  });

  const onSubmit = async (data: MedicationFormValues) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(data);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      reset();
    }, 2500);
  };

  return (
    <div className="glass rounded-3xl p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
          <Pill size={20} />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold">Add Medication</h2>
          <p className="text-sm text-text/60">Track a new prescription or supplement.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80">Medication Name</label>
            <input 
              {...register("name")}
              placeholder="e.g. Lisinopril"
              className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80">Dosage</label>
            <input 
              {...register("dosage")}
              placeholder="e.g. 10mg"
              className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none"
            />
            {errors.dosage && <p className="text-xs text-red-500">{errors.dosage.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80">Frequency</label>
            <select 
              {...register("frequency")}
              className="w-full h-12 px-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none appearance-none"
            >
              <option value="daily">Daily</option>
              <option value="twice">Twice a day</option>
              <option value="weekly">Weekly</option>
              <option value="as_needed">As needed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text/80">Time</label>
            <div className="relative">
              <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40" />
              <input 
                type="time"
                {...register("time")}
                className="w-full h-12 pl-10 pr-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none [color-scheme:dark]"
              />
            </div>
            {errors.time && <p className="text-xs text-red-500">{errors.time.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text/80">Instructions / Notes (Optional)</label>
          <textarea 
            {...register("notes")}
            placeholder="e.g. Take with food"
            className="w-full h-24 p-4 rounded-xl bg-background border border-white/10 focus:border-accent focus:ring-1 focus:ring-accent transition-all outline-none resize-none"
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting || isSuccess}
          className="w-full h-12 rounded-xl bg-accent text-white font-medium flex items-center justify-center gap-2 hover:bg-accent/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          ) : isSuccess ? (
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
              <CheckCircle2 size={18} /> Added Successfully
            </motion.div>
          ) : (
            <>
              <Plus size={18} /> Add Medication
            </>
          )}
        </button>
      </form>
    </div>
  );
}
