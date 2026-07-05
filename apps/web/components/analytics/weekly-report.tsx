"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Download, Loader2 } from "lucide-react";
import { useAuth } from "../../lib/auth-context";
import { useFetch } from "../../hooks/useFetch";

export function WeeklyReport() {
  const { selectedMemberId } = useAuth();
  const { data, isLoading } = useFetch<{ report?: string; markdown?: string; generatedAt?: string }>(
    selectedMemberId ? `/ai/weekly-report?familyMemberId=${selectedMemberId}` : null
  );

  const reportContent = data?.report || data?.markdown || "";
  const generatedDate = data?.generatedAt
    ? new Date(data.generatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div>
          <h2 className="font-heading text-xl font-bold flex items-center gap-2">
            <FileText size={20} className="text-accent-secondary" />
            AI Weekly Report
          </h2>
          <p className="text-sm text-text/60">Generated {generatedDate}</p>
        </div>
        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-text/80">
          <Download size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto prose prose-sm prose-invert prose-headings:font-heading prose-a:text-accent prose-strong:text-accent max-w-none pr-4 scrollbar-hide">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 animate-spin text-text/40" />
          </div>
        ) : reportContent ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{reportContent}</ReactMarkdown>
        ) : (
          <div className="text-center text-text/40 py-12">
            <p className="text-sm">Not enough data to generate a weekly report yet.</p>
            <p className="text-xs mt-1">Track your health for a week to get your first AI report.</p>
          </div>
        )}
      </div>
    </div>
  );
}
