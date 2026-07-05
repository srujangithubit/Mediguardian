"use client";

import { Bell, Search, Menu, Sun, Moon, Laptop, Keyboard } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CommandMenu } from "./command-menu";
import { FamilySwitcher } from "./family-switcher";

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      <header className="h-20 bg-card/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-30 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-white/5 text-text/80 transition-colors"
          >
            <Menu size={24} />
          </button>

          {/* Family Switcher */}
          <div className="hidden lg:block border-r border-white/10 pr-4 mr-2">
            <FamilySwitcher />
          </div>

          {/* Cmd+K Search Design */}
          <button 
            onClick={() => setCommandOpen(true)}
            className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-black/20 border border-white/5 hover:border-white/10 dark:hover:border-white/20 transition-all text-text/50 w-full max-w-md group focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <Search size={18} className="group-hover:text-accent transition-colors" />
            <span className="text-sm">Search patients, records, or commands...</span>
            <div className="ml-auto flex gap-1 items-center">
              <kbd className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-white/10 text-[11px] font-medium font-mono border border-white/5 text-text/60">
                ⌘
              </kbd>
              <kbd className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-white/10 text-[11px] font-medium font-mono border border-white/5 text-text/60">
                K
              </kbd>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Search Icon */}
          <button 
            onClick={() => setCommandOpen(true)}
            className="sm:hidden p-2.5 rounded-full hover:bg-white/5 text-text/80 transition-colors"
          >
            <Search size={20} />
          </button>

          {/* Theme Toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2.5 rounded-full hover:bg-white/5 text-text/80 transition-colors"
            >
              {mounted && theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            
            <AnimatePresence>
              {showThemeMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowThemeMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-36 glass rounded-2xl p-2 z-50 border border-white/10 shadow-xl"
                  >
                    <button onClick={() => { setTheme("light"); setShowThemeMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-white/10 transition-colors">
                      <Sun size={16} className="text-text/60" /> Light
                    </button>
                    <button onClick={() => { setTheme("dark"); setShowThemeMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-white/10 transition-colors">
                      <Moon size={16} className="text-text/60" /> Dark
                    </button>
                    <button onClick={() => { setTheme("system"); setShowThemeMenu(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-white/10 transition-colors">
                      <Laptop size={16} className="text-text/60" /> System
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          <button className="p-2.5 rounded-full hover:bg-white/5 text-text/80 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent border-2 border-card" />
          </button>
          
          {/* Mobile Family Switcher (instead of profile pic alone on mobile) */}
          <div className="lg:hidden pl-2 border-l border-white/10">
            <FamilySwitcher />
          </div>
        </div>
      </header>

      <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
    </>
  );
}
