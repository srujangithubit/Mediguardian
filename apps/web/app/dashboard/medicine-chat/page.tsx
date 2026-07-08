'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Pill, AlertTriangle, Factory, ChevronDown, ChevronUp, CheckCircle, Star } from 'lucide-react';

export default function MedicineChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your 100% offline Medicine AI. Ask me about any medicine, its uses, side effects, or composition.', results: [] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, results: [] }]);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:4000/ai/medicine-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage, history: [] })
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const json = await res.json();
      const data = json.data || json; // Handle NestJS transform interceptor

      const results = data.results || [];
      const assistantMessage = results.length > 0 
        ? `I found ${results.length} result(s) for your query.` 
        : "I couldn't find any medicines matching your query.";

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: assistantMessage,
        results: results
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the search engine.', results: [] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700 flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Advanced Medicine Search Engine</h1>
          <p className="text-xs text-slate-400">Offline Hybrid Search (BM25 + FAISS + RapidFuzz)</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-blue-400'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`max-w-[90%] space-y-3 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none leading-relaxed'}`}>
                {msg.content}
              </div>

              {/* Rich Results UI */}
              {msg.results && msg.results.length > 0 && (
                <div className="flex flex-col gap-4 mt-2 w-full">
                  {msg.results.map((result: any, i: number) => (
                    <MedicineCard key={i} result={result} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 flex-row">
            <div className="shrink-0 w-8 h-8 rounded-full bg-slate-700 text-blue-400 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 rounded-tl-none flex items-center gap-2 text-slate-400">
              <Loader2 size={16} className="animate-spin" />
              <span>Querying hybrid search engine...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800/50 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by medicine, symptom, manufacturer..."
            disabled={isLoading}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 transition-all"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <div className="mt-2 flex gap-2 overflow-x-auto custom-scrollbar pb-1">
          {['headache tablet', 'medicines with paracetamol', 'who makes crocin?'].map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(suggestion)}
              className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full text-slate-300 whitespace-nowrap transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MedicineCard({ result }: { result: any }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden transition-all duration-200 shadow-lg">
      <div 
        className="p-4 cursor-pointer hover:bg-slate-700/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4 flex-1">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Pill size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              {result.name}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400">
              <span className="flex items-center gap-1 font-medium text-emerald-400">
                <CheckCircle size={14} /> 
                {result.confidence}% Match
              </span>
              <span className="text-yellow-400 tracking-widest text-xs">{result.stars}</span>
              <span className="flex items-center gap-1">
                <Factory size={14} /> {result.manufacturer}
              </span>
            </div>
          </div>
        </div>
        <div className="text-slate-400 self-center hidden sm:block">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 bg-slate-900/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Composition</h4>
                <p className="text-sm text-slate-300 bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                  {result.composition}
                </p>
              </div>

              {result.uses && result.uses.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Uses</h4>
                  <ul className="text-sm text-slate-300 space-y-1 bg-slate-800 p-3 rounded-lg border border-slate-700/50">
                    {result.uses.map((use: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span> {use}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {result.side_effects && result.side_effects.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2 flex items-center gap-1">
                    <AlertTriangle size={14} className="text-amber-500" /> Side Effects
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.side_effects.map((se: string, i: number) => (
                      <span key={i} className="text-xs bg-amber-500/10 text-amber-200 border border-amber-500/20 px-2 py-1 rounded-md">
                        {se}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.variants && result.variants.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-2">Clustered Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.variants.slice(0, 5).map((variant: string, i: number) => (
                      <span key={i} className="text-xs bg-slate-700/50 text-slate-300 border border-slate-600 px-2 py-1 rounded-md">
                        {variant}
                      </span>
                    ))}
                    {result.variants.length > 5 && (
                      <span className="text-xs bg-slate-700/50 text-slate-400 border border-slate-600 px-2 py-1 rounded-md">
                        +{result.variants.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

