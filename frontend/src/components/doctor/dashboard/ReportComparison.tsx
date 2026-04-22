import React from 'react';

interface ComparisonData {
  previousValue: number;
  trendDirection: 'up' | 'down' | 'stable';
  improvementStatus: 'improving' | 'deteriorating' | 'neutral';
}

interface BiomarkerWithComparison {
  _id: string;
  biomarkerName: string;
  value: number;
  unit: string;
  isAbnormal: boolean;
  comparison?: ComparisonData | null;
}

interface ReportComparisonProps {
  biomarkers: BiomarkerWithComparison[];
}

const ReportComparison: React.FC<ReportComparisonProps> = ({ biomarkers }) => {
  // Only show biomarkers that have comparison data
  const comparableItems = biomarkers.filter(b => b.comparison);

  if (comparableItems.length === 0) {
    return (
      <div className="p-8 text-center bg-[var(--background)] rounded-[30px] border border-dashed border-[var(--border)]">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Report: No Prior Historical Data</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] p-8 border border-[var(--border)] shadow-sm">
      <div className="flex items-center justify-between mb-8">
         <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Longitudinal Comparison</h3>
         <span className="text-[9px] font-black text-[var(--secondary)] border border-[var(--secondary)]/20 px-3 py-1 rounded-full uppercase tracking-widest">Vs Previously Recorded</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--background)]">
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Parameter</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Prev</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Curr</th>
              <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--background)]">
            {comparableItems.map((b) => (
              <tr key={b._id} className="group hover:bg-[var(--background)]/50 transition-colors">
                <td className="py-4">
                   <p className="font-black text-xs text-[var(--foreground)] uppercase tracking-tight">{b.biomarkerName}</p>
                </td>
                <td className="py-4 text-center">
                   <span className="text-xs font-bold text-gray-400">{b.comparison?.previousValue} {b.unit}</span>
                </td>
                <td className="py-4 text-center">
                   <span className={`text-xs font-black ${b.isAbnormal ? 'text-rose-600' : 'text-[var(--primary)]'}`}>
                     {b.value} {b.unit}
                   </span>
                </td>
                <td className="py-4 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5">
                       {b.comparison?.trendDirection === 'up' && (
                          <svg className="text-gray-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                       )}
                       {b.comparison?.trendDirection === 'down' && (
                          <svg className="text-gray-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                       )}
                       <span className={`text-[10px] font-black uppercase tracking-tighter ${
                          b.comparison?.improvementStatus === 'improving' ? 'text-emerald-600' : 
                          b.comparison?.improvementStatus === 'deteriorating' ? 'text-rose-600' : 'text-gray-400'
                       }`}>
                          {b.comparison?.improvementStatus}
                       </span>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportComparison;
