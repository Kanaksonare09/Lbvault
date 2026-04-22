'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getMetricStatus, SmartStatus } from '../../utils/clinicalMetrics';

interface HealthInsightCardProps {
    label: string; // e.g., 'hemoglobin', 'cholesterol', 'glucose'
    value: number;
    unit: string;
    ranges?: {
        min: number;
        max: number;
    };
}

export default function HealthInsightCard({ label, value, unit, ranges }: HealthInsightCardProps) {
    const { t } = useLanguage();

    const smartStatus = getMetricStatus(label, value);

    const statusConfig: Record<SmartStatus, { text: string; color: string; border: string; bg: string; bar: string; icon: React.ReactNode }> = {
        safe: {
            text: "Verified Safe",
            color: "text-[var(--primary)]",
            bg: "bg-[#F0F5F5]",
            border: "border-[var(--primary)]/10",
            bar: "bg-[var(--primary)]",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        },
        mild: {
            text: "Monitoring",
            color: "text-[var(--primary)]",
            bg: "bg-[var(--accent-soft)]",
            border: "border-[var(--primary)]/10",
            bar: "bg-[var(--primary)]",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        },
        urgent: {
            text: "See Doctor",
            color: "text-[#9B4E4E]",
            bg: "bg-[#FDF8F8]",
            border: "border-[#9B4E4E]/10",
            bar: "bg-[#9B4E4E]",
            icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        }
    };

    const config = statusConfig[smartStatus];
    const statusText = smartStatus === 'safe' ? "Clinic verified value." : config.text;

    // Calculate percentage for a small progress bar
    const progress = ranges ? Math.min(Math.max(((value - (ranges.min * 0.5)) / (ranges.max * 1.5 - (ranges.min * 0.5))) * 100, 5), 95) : 50;

    return (
        <div className="group bg-white p-6 rounded-[32px] shadow-sm border border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-[var(--primary)]/5 transition-all duration-300 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150 ${config.bar}`}></div>
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center space-x-3">
                    <div className={`p-2.5 rounded-2xl ${config.bg} ${config.color} border ${config.border}`}>
                        {config.icon}
                    </div>
                    <div>
                        <h4 className="text-[var(--muted-foreground)] text-[10px] font-black uppercase tracking-[0.15em] mb-0.5">{t(label)}</h4>
                        <p className="text-2xl font-black text-[var(--foreground)] flex items-baseline tracking-tight">
                            {value} <span className="text-[10px] text-[#94A3B8] font-bold ml-1 uppercase">{unit}</span>
                        </p>
                    </div>
                </div>
                <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-colors ${config.color} ${config.bg} ${config.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${config.bar} animate-pulse`}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest">
                        {smartStatus === 'safe' ? t('safe') || 'Safe' : smartStatus === 'mild' ? t('mild') || 'Mild' : t('urgent') || 'Urgent'}
                    </span>
                </div>
            </div>
 
            <div className="relative h-1.5 bg-[#F8FAFC] rounded-full overflow-hidden mb-4 border border-slate-100">
                <div 
                    className={`absolute top-0 left-0 h-full ${config.bar} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
 
            <div className="flex items-start space-x-2">
                <p className={`text-[11px] font-bold leading-relaxed tracking-tight ${smartStatus === 'safe' ? 'text-emerald-700' : smartStatus === 'mild' ? 'text-[var(--primary)]' : 'text-rose-700'}`}>
                    {statusText}
                </p>
            </div>
        </div>
    );
}
