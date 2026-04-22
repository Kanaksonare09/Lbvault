import React from 'react';

interface OCRTableProps {
  data: Record<string, any>;
  title?: string;
}

const OCRTable: React.FC<OCRTableProps> = ({ data, title = "Extracted Intelligence" }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <p className="text-sm font-medium text-gray-400">No structured data found in this report.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-[var(--border)] shadow-sm">
      <h3 className="text-xs font-black text-[var(--primary)] uppercase tracking-[0.2em] mb-6">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--background)]">
              <th className="pb-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest">Parameter</th>
              <th className="pb-4 text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--background)]">
            {Object.entries(data).map(([key, value]) => (
              <tr key={key} className="group hover:bg-[var(--background)]/50 transition-colors">
                <td className="py-3 font-bold text-sm text-[var(--foreground)] capitalize">{key.replace(/_/g, ' ')}</td>
                <td className="py-3 text-right">
                  <span className="text-sm font-black text-[var(--primary)]">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OCRTable;
