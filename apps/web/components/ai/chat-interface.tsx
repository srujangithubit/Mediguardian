"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Stethoscope, Paperclip, Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your MediGuardian Copilot. I can help analyze your health data, explain medications, or answer medical queries. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { selectedMemberId } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !selectedMemberId) return;
    
    const userMessage = input.trim();
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userMessage };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Map our frontend message structure to the Gemini history structure
      const history = messages.filter(m => m.id !== '1').map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const response = await api.post('/ai/copilot/chat', {
        familyMemberId: selectedMemberId,
        message: userMessage,
        history,
      });

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data?.reply || response.reply || "I'm having trouble processing that right now."
      }]);
    } catch (error) {
      console.error("Copilot Chat Error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't reach the server. Please ensure the backend is running and the Gemini API key is configured."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="glass rounded-3xl overflow-hidden flex flex-col h-[600px] border border-white/5 relative">
      <div className="h-16 border-b border-white/5 flex items-center px-6 bg-card/40 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-secondary p-[1px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
              <Stethoscope size={16} className="text-accent" />
            </div>
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm">Health Copilot</h3>
            <p className="text-[10px] text-accent font-medium flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
              </span>
              Online
            </p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide relative">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-text/10 text-text' : 'bg-accent/10 text-accent'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed prose prose-sm prose-invert ${
                msg.role === 'user' 
                  ? 'bg-accent text-white rounded-tr-sm' 
                  : 'bg-background/60 border border-white/5 rounded-tl-sm text-text/80'
              }`}>
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="bg-background/60 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex gap-1">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-text/40" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-text/40" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-text/40" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-background/40 backdrop-blur-md border-t border-white/5 shrink-0">
        <div className="relative flex items-end gap-2 bg-card border border-white/10 rounded-2xl p-2 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all">
          <button className="p-2 rounded-xl text-text/40 hover:text-text/80 hover:bg-white/5 transition-colors shrink-0">
            <Paperclip size={18} />
          </button>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your health..."
            className="w-full max-h-32 bg-transparent border-none outline-none resize-none text-sm py-2 placeholder:text-text/30"
            rows={1}
            style={{ minHeight: '36px' }}
          />
          
          {input.trim() ? (
            <button 
              onClick={handleSend}
              className="p-2 rounded-xl bg-accent text-white hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              <Send size={18} />
            </button>
          ) : (
            <button className="p-2 rounded-xl text-text/40 hover:text-text/80 hover:bg-white/5 transition-colors shrink-0">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
