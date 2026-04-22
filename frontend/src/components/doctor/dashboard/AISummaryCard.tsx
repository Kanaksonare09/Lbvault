import React from 'react';

interface AISummaryCardProps {
  summary: string | null;
  confidence?: number;
}

const AISummaryCard: React.FC<AISummaryCardProps> = ({ summary, confidence }) => {
  if (!summary) return null;

  return (
    <div className="bg-white rounded-[40px] p-8 border border-[var(--border)] shadow-sm relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 p-8 text-[var(--secondary)]/10 group-hover:text-[var(--secondary)]/20 transition-colors pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
      </div>
      
      <div className="flex items-center gap-3 mb-6 relative">
         <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
         <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">AI Clinical Synthesis</h3>
         {confidence && (
            <span className="ml-auto text-[8px] font-black text-[var(--secondary)] border border-[var(--secondary)]/20 px-2 py-0.5 rounded-full">
               CONFIDENCE: {Math.round(confidence * 100)}%
            </span>
         )}
      </div>

      <div 
        className="text-[var(--foreground)] font-medium leading-[1.8] text-lg relative"
        dangerouslySetInnerHTML={{ 
          __html: summary.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--primary)] font-black">$1</strong>') 
        }}
      />
    </div>
  );
};

export default AISummaryCard;
