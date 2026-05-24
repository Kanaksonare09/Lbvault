'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface TimelineData {
    date: string;
    value: number;
}

interface HealthTimelineProps {
    label: string;
    unit: string;
    data: TimelineData[];
    status: 'improving' | 'stable' | 'decreasing';
}

export default function HealthTimeline({ label, unit, data, status }: HealthTimelineProps) {
    const { t } = useLanguage();

    const statusConfig = {
        improving: { text: "Improving", color: "text-[#2D5A5A]", bg: "bg-[#F0F5F5]", icon: "↑" },
        stable: { text: "Stable", color: "text-[#4A5568]", bg: "bg-[#F7FAFC]", icon: "→" },
        decreasing: { text: "Needs Attention", color: "text-[#9B2C2C]", bg: "bg-[#FFF5F5]", icon: "↓" }
    };

    const config = statusConfig[status];

    // SVG Canvas Dimensions
    const height = 100;
    const width = 400;
    const padding = 20;
    
    const minVal = Math.min(...data.map(d => d.value)) * 0.95;
    const maxVal = Math.max(...data.map(d => d.value)) * 1.05;
    const range = Math.max(maxVal - minVal, 1);

    // Calculate Coordinates
    const coords = data.map((d, i) => ({
        x: (i / (data.length - 1)) * (width - padding * 2) + padding,
        y: height - ((d.value - minVal) / range) * (height - padding * 2) - padding
    }));

    // Create Bézier Curve Path (Catmull-Rom approximation)
    let pathData = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
        const curr = coords[i];
        const next = coords[i + 1];
        const cp1x = curr.x + (next.x - curr.x) / 2;
        const cp1y = curr.y;
        const cp2x = curr.x + (next.x - curr.x) / 2;
        const cp2y = next.y;
        pathData += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
    }

    return (
        <div className="bg-[#FCFDFB] p-8 rounded-[32px] border border-[var(--border)] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            {/* Clinical Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            <div className="relative z-10 flex flex-col lg:flex-row items-end justify-between gap-8">
                <div className="w-full lg:w-1/3 space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color} border border-current opacity-70`}>
                            Clinical Trend
                        </div>
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.color}`}>
                            {config.icon} {config.text}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-medium text-[var(--foreground)] tracking-tight capitalize leading-none mb-2">
                            {t(label) || label} <span className="text-[#94A3B8] font-light">Progress</span>
                        </h3>
                        <p className="text-[#64748B] text-xs font-normal leading-relaxed">
                            A longitudinal analysis of your {label} levels across recent diagnostic windows.
                        </p>
                    </div>
                </div>

                <div className="flex-1 w-full flex flex-col sm:flex-row items-end justify-end gap-8">
                    <div className="relative flex-1 max-w-[400px]">
                        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible drop-shadow-sm">
                            <path
                                d={pathData}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-80"
                            />
                            {coords.map((c, i) => (
                                <g key={i} className="group/point">
                                    <circle 
                                        cx={c.x} 
                                        cy={c.y} 
                                        r="5" 
                                        fill="white" 
                                        stroke="var(--primary)" 
                                        strokeWidth="2"
                                        className="transition-transform duration-300 group-hover/point:scale-150"
                                    />
                                    {i === coords.length - 1 && (
                                        <circle cx={c.x} cy={c.y} r="12" fill="var(--primary)" className="animate-ping opacity-10" />
                                    )}
                                </g>
                            ))}
                        </svg>
                    </div>

                    <div className="text-right shrink-0 pb-1">
                        <div className="text-4xl font-light text-[var(--foreground)] flex items-baseline justify-end">
                            {data[data.length - 1].value}
                            <span className="text-sm text-[#94A3B8] ml-2 font-medium uppercase tracking-tighter">{unit}</span>
                        </div>
                        <div className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-[0.2em] mt-1 opacity-50">Current Metric</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
