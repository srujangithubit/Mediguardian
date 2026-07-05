"use client";

import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { FileText, Users, Activity, Pill, Settings, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export function CommandMenu({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent forceMount className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] outline-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative z-50 w-full max-w-2xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden glass"
            >
              <DialogTitle className="sr-only">Command Menu</DialogTitle>
              <Command
                className="w-full flex flex-col"
                loop
                filter={(value, search) => {
                  if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                  return 0;
                }}
              >
                <div className="flex items-center px-4 py-3 border-b border-white/10">
                  <Search size={18} className="text-text/40 mr-2 shrink-0" />
                  <Command.Input 
                    autoFocus 
                    placeholder="Search patients, medications, settings..."
                    className="flex-1 bg-transparent border-none outline-none text-text placeholder:text-text/40 text-[15px]"
                  />
                  <button onClick={() => setOpen(false)} className="p-1 rounded-md hover:bg-white/10 text-text/40">
                    <X size={16} />
                  </button>
                </div>

                <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-hide">
                  <Command.Empty className="py-6 text-center text-text/40 text-sm">
                    No results found.
                  </Command.Empty>
                  
                  <Command.Group heading="Navigation" className="text-xs font-medium text-text/40 px-2 py-2">
                    <Command.Item 
                      onSelect={() => runCommand(() => router.push("/dashboard/patients"))}
                      className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm text-text/80 aria-selected:bg-accent/10 aria-selected:text-accent cursor-pointer transition-colors"
                    >
                      <Users size={16} /> Patients
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => runCommand(() => router.push("/dashboard/medications"))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text/80 aria-selected:bg-accent/10 aria-selected:text-accent cursor-pointer transition-colors"
                    >
                      <Pill size={16} /> Medications
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => runCommand(() => router.push("/dashboard/telemetry"))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-text/80 aria-selected:bg-accent/10 aria-selected:text-accent cursor-pointer transition-colors"
                    >
                      <Activity size={16} /> Telemetry
                    </Command.Item>
                  </Command.Group>

                  <Command.Group heading="Settings" className="text-xs font-medium text-text/40 px-2 py-2 mt-2">
                    <Command.Item 
                      onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                      className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl text-sm text-text/80 aria-selected:bg-accent/10 aria-selected:text-accent cursor-pointer transition-colors"
                    >
                      <Settings size={16} /> Preferences
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
