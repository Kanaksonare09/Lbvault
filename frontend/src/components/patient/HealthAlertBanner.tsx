'use client';

import React from 'react';

interface HealthAlertBannerProps {
    message: string;
    type?: 'warning' | 'info' | 'critical';
}

export default function HealthAlertBanner({ message, type = 'info' }: HealthAlertBannerProps) {
    const bgColor = type === 'critical' ? 'bg-rose-50 border-rose-200' : 'bg-[var(--accent-soft)] border-[var(--border)]';
    const textColor = type === 'critical' ? 'text-rose-800' : 'text-amber-800';
    const iconColor = type === 'critical' ? '#E11D48' : 'var(--primary)';

    return (
        <div className={`flex items-start p-4 rounded-2xl border ${bgColor} ${textColor} mb-8 animate-in slide-in-from-top duration-500`}>
            <div className="mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <div>
                <p className="text-sm font-bold leading-relaxed">{message}</p>
            </div>
        </div>
    );
}
