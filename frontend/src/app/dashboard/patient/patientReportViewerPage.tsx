'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import HealthInsightCard from '@/components/patient/HealthInsightCard';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';

// Mock report for viewer
const mockReport = {
    _id: "1",
    reportName: "Complete Blood Count",
    testType: "Blood Test",
    pathologyLab: "City Pathology Lab",
    uploadDate: "2026-02-10",
    insights: [
        { label: "hemoglobin", value: 14.5, unit: "g/dL", ranges: { min: 13.5, max: 17.5 } },
        { label: "cholesterol", value: 210, unit: "mg/dL", ranges: { min: 125, max: 200 } },
        { label: "glucose", value: 95, unit: "mg/dL", ranges: { min: 70, max: 100 } }
    ],
    doctorComment: "Your hemoglobin is healthy. Cholesterol is slightly high, consider low-fat diet."
};

export default function PatientReportViewerPage() {
    const { t } = useLanguage();

    return (
        <div className="space-y-8 pb-12 h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <button onClick={() => window.history.back()} className="p-2 hover:bg-white rounded-xl transition-colors text-[var(--primary)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                        <h1 className="text-whitexl font-black text-[var(--foreground)] tracking-tight">{mockReport.reportName}</h1>
                    </div>
                    <p className="text-[var(--muted-foreground)] text-sm font-bold uppercase tracking-widest flex items-center">
                        <span className="w-2 h-2 bg-[var(--secondary)] rounded-full mr-2"></span>
                        {mockReport.pathologyLab} • {new Date(mockReport.uploadDate).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <VoiceSummaryButton text={`Health summary for your ${mockReport.reportName}. ${mockReport.insights.map(i => `${t(i.label)} is ${i.value}`).join('. ')}`} />
                    <button className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-[var(--foreground)] transition-all">Download PDF</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-[600px]">
                {/* Left: Report Preview (Placeholder) */}
                <div className="lg:col-span-7 bg-white rounded-[40px] shadow-sm border border-[var(--border)] overflow-hidden flex flex-col">
                    <div className="p-4 bg-[var(--background)] border-b border-[var(--border)] flex justify-between items-center">
                        <span className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest">Digital PDF Preview</span>
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#DEE2E6] flex items-center justify-center p-12">
                        <div className="bg-white w-full max-w-lg h-full rounded-lg shadow-2xl p-12 flex flex-col space-y-6">
                            <div className="h-4 bg-[var(--background)] w-3/4 rounded-full"></div>
                            <div className="h-4 bg-[var(--background)] w-1/2 rounded-full"></div>
                            <div className="h-32 bg-[var(--background)] w-full rounded-2xl"></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-4 bg-[var(--background)] w-full rounded-full"></div>
                                <div className="h-4 bg-[var(--background)] w-full rounded-full"></div>
                            </div>
                            <div className="h-4 bg-[var(--background)] w-5/6 rounded-full"></div>
                            <div className="h-4 bg-[var(--background)] w-2/3 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right: Insights & AI Summary */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[var(--border)]">
                        <h3 className="text-xl font-black text-[var(--foreground)] mb-6 flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                            <span>OCR AI Insights</span>
                        </h3>

                        <div className="space-y-4">
                            {mockReport.insights.map((insight, idx) => (
                                <HealthInsightCard
                                    key={idx}
                                    label={insight.label}
                                    value={insight.value}
                                    unit={insight.unit}
                                    ranges={insight.ranges}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="bg-[var(--primary)] p-8 rounded-[40px] shadow-lg text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                            </div>
                            <h3 className="text-lg font-black tracking-tight line-clamp-1">Doctor Review</h3>
                        </div>
                        <div className="bg-white/10 p-6 rounded-3xl border border-white/20 backdrop-blur-sm">
                            <p className="text-sm italic font-medium leading-relaxed">"{mockReport.doctorComment}"</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--secondary)]">Dr. S. K. Sharma</span>
                                <span className="text-[10px] font-bold text-white/60">Feb 11, 2026</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
