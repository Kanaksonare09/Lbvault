import React from 'react';
import StatusBadge from './StatusBadge';

interface Abnormality {
  _id: string;
  biomarkerName: string;
  value: number;
  unit: string;
  severity: string;
}

interface AbnormalityListProps {
  abnormalities: Abnormality[];
}

const AbnormalityList: React.FC<AbnormalityListProps> = ({ abnormalities }) => {
  if (!abnormalities || abnormalities.length === 0) {
    return (
      <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 flex items-center gap-4">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div>
           <p className="text-sm font-black text-emerald-800 uppercase tracking-tight">Status Normal</p>
           <p className="text-xs font-medium text-emerald-600">No critical anomalies detected in this report.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4">Urgent Attention Required</p>
      <div className="grid grid-cols-1 gap-3">
        {abnormalities.map((item) => (
          <div key={item._id} className="bg-white p-4 rounded-2xl border border-[var(--border)] shadow-sm flex items-center justify-between group hover:border-rose-200 transition-colors">
            <div className="flex items-center gap-4">
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               <div>
                  <p className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight">{item.biomarkerName}</p>
                  <p className="text-[10px] font-bold text-gray-400 capitalize">{item.severity} Deviation</p>
               </div>
            </div>
            <div className="text-right flex flex-col items-end gap-1">
               <span className="text-sm font-black text-rose-600">
                  {item.value} <span className="text-[10px] opacity-60 ml-0.5">{item.unit}</span>
               </span>
               <StatusBadge severity={item.severity} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AbnormalityList;
