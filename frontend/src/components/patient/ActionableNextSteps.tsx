'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface ActionStep {
    icon: string;
    text: string;
}

interface ActionableNextStepsProps {
    steps: ActionStep[];
}

export default function ActionableNextSteps({ steps }: ActionableNextStepsProps) {
    const { t } = useLanguage();

    if (!steps || steps.length === 0) return null;

    return (
        <div className="bg-[#FFFDF5] p-10 rounded-[48px] border border-[#E9E1C1]/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
            {/* Soft Paper Texture Line */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#E9E1C1]/30"></div>
            
            <div className="relative z-10 space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E9E1C1]/50 pb-8">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white text-[var(--primary)] rounded-2xl border border-[#E9E1C1]/50 shadow-sm transition-transform duration-500 group-hover:rotate-12">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 7-5-5-5 5"/><path d="m17 17-5 5-5-5"/></svg>
                        </div>
                        <div>
                            <h4 className="text-[12px] font-black text-[var(--primary)] uppercase tracking-[0.25em] mb-1 leading-none">{t('prescription_advice') || 'Doctor’s Guidance'}</h4>
                            <p className="text-[var(--muted-foreground)] text-sm font-medium tracking-tight">Personalized action plan for your health journey</p>
                        </div>
                    </div>
                    <div className="text-[10px] font-bold text-[var(--primary)]/40 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full border border-[#E9E1C1]/30">
                        Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
                    {steps.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-5 group/item cursor-default">
                            <div className="flex flex-col items-center shrink-0">
                                <div className="text-3xl mb-1 transform transition-all duration-300 group-hover/item:scale-125 group-hover/item:-rotate-12">
                                    {step.icon}
                                </div>
                                <div className="w-0.5 h-8 bg-gradient-to-b from-[#E9E1C1]/50 to-transparent"></div>
                            </div>
                            <div className="pt-2">
                                <p className="text-lg text-[var(--foreground)] font-medium leading-snug tracking-tight group-hover/item:translate-x-1 transition-transform duration-300">
                                    {t(step.text) || step.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 flex items-center justify-between border-t border-[#E9E1C1]/30">
                    <div className="flex items-center space-x-2 text-[var(--primary)]/70">
                        <div className="w-2 h-2 rounded-full bg-[var(--secondary)] animate-pulse"></div>
                        <span className="text-[10px] font-bold tracking-[0.1em] uppercase opacity-70 italic">Small steps lead to big change</span>
                    </div>
                    <div className="h-6 w-24 opacity-20 filter grayscale contrast-125 select-none pointer-events-none overflow-hidden">
                        <svg viewBox="0 0 100 40" className="w-full h-full text-[var(--primary)]" style={{ opacity: 0.5 }}>
                            <path d="M10,20 Q30,10 50,20 T90,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
