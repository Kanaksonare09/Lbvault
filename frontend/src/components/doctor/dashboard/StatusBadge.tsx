import React from 'react';

interface StatusBadgeProps {
  severity: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ severity }) => {
  const styles: Record<string, string> = {
    Critical: 'bg-rose-50 text-rose-700 border-rose-100',
    Moderate: 'bg-amber-50 text-amber-700 border-amber-100',
    Mild: 'bg-amber-50 text-amber-700 border-amber-100',
    Normal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  };

  const currentStyle = styles[severity] || styles.Normal;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${currentStyle}`}>
      {severity}
    </span>
  );
};

export default StatusBadge;
