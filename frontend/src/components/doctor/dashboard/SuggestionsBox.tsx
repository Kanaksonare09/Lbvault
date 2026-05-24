import React from 'react';

interface SuggestionsBoxProps {
  suggestions: string[];
}

const SuggestionsBox: React.FC<SuggestionsBoxProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/></svg>
        </div>
        <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">AI Clinical Suggestions</h3>
      </div>
      
      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start gap-3 group">
             <div className="w-1.5 h-1.5 bg-[var(--secondary)] rounded-full mt-1.5 group-hover:scale-125 transition-transform" />
             <p className="text-xs font-medium text-[var(--foreground)] leading-relaxed italic">
               {suggestion}
             </p>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-[var(--background)]">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
          ⚠️ DISCLAIMER: Suggestions are strictly non-diagnostic logic. Correlate with clinical findings.
        </p>
      </div>
    </div>
  );
};

export default SuggestionsBox;
