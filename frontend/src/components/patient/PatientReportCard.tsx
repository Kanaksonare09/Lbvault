'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Link from 'next/link';
import { getMetricConfig } from '@/utils/clinicalMetrics';
import { reportService } from '@/services/reportService';
import ShareReport from './features/ShareReport';
import VoiceReport from './features/VoiceReport';
import { Report } from '@/types';

interface PatientReportCardProps {
    report: Report;
}

export default function PatientReportCard({ report: initialReport }: PatientReportCardProps) {
    const { t } = useLanguage();
    const [report, setReport] = useState(initialReport);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine health status based on extracted data
    const getHealthStatus = () => {
        if (!report.extractedData) return 'normal';

        let isAbnormal = false;
        Object.values(report.extractedData).forEach((data: any) => {
            // Check if it's a rich object from our recent backend update
            if (data && typeof data === 'object' && data.isAbnormal) {
                isAbnormal = true;
            }
            // Fallback for legacy simple numeric values
            else if (typeof data === 'number') {
                const config = getMetricConfig(Object.keys(report.extractedData!).find(key => report.extractedData![key] === data) || '');
                if (config && (data < config.min || data > config.max)) isAbnormal = true;
            }
        });

        return isAbnormal ? 'abnormal' : 'normal';
    };

    const healthStatus = getHealthStatus();

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[var(--border)] hover:shadow-xl hover:shadow-[var(--primary)]/5 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--background)] rounded-full -mr-32 -mt-32 opacity-50 group-hover:bg-[var(--accent)]/30 transition-colors duration-700"></div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <div className="flex items-start space-x-5">
                        <div className="hidden sm:flex p-5 bg-[var(--background)] rounded-[24px] border border-[var(--border)] group-hover:border-[var(--primary)]/30 transition-all duration-500 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <path d="M8 13h8" /><path d="M8 17h8" /><path d="M10 9H8" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-2xl font-black text-[var(--foreground)] tracking-tight group-hover:text-[var(--primary)] transition-colors">{report.reportName}</h3>
                                {report.aiSummary ? (
                                    <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border animate-in fade-in duration-1000 ${healthStatus === 'abnormal' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-[var(--accent)] text-[var(--primary)] border-[var(--border)]'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${healthStatus === 'abnormal' ? 'bg-rose-500' : 'bg-[var(--primary)]'}`}></div>
                                        <span>{healthStatus === 'abnormal' ? 'Attention' : 'Healthy'}</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 uppercase tracking-widest">Processing</span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-[var(--muted-foreground)]">
                                <span className="flex items-center text-[var(--primary)]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] mr-2"></span>
                                    {report.testType}
                                </span>
                                <span className="w-1 h-1 bg-[var(--border)] rounded-full hidden sm:block"></span>
                                <span className="flex items-center">
                                    <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><path d="M3 10h18" /><path d="M8 2v4" /><path d="M16 2v4" /></svg>
                                    {report.uploadDate ? new Date(report.uploadDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '---'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-center lg:justify-start gap-4 lg:border-l lg:border-[var(--border)] lg:pl-8">
                    <div className="flex flex-col gap-2.5 w-full lg:w-52 mb-4 lg:mb-0">
                        {/* Action Buttons Group */}
                        <Link
                            href={`/dashboard/patient/reports/${report._id}`}
                            className="flex items-center justify-center space-x-2 bg-[var(--primary)] text-white px-6 py-3.5 rounded-[22px] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary)] shadow-md hover:shadow-xl transition-all active:scale-95 group/btn"
                        >
                            <svg className="group-hover/btn:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" /></svg>
                            <span>{t('view_insights') || 'View Insights'}</span>
                        </Link>

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href={`/dashboard/patient/reports/${report._id}`}
                                className="flex items-center justify-center space-x-2 bg-white text-gray-500 border-2 border-[var(--border)] px-4 py-3 rounded-[20px] font-black text-[9px] uppercase tracking-widest hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                <span>{t('view') || 'View'}</span>
                            </Link>

                            <a
                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2 bg-white text-gray-500 border-2 border-[var(--border)] px-4 py-3 rounded-[20px] font-black text-[9px] uppercase tracking-widest hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] transition-all"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                <span>{t('download') || 'PDF'}</span>
                            </a>
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                            <VoiceReport reportId={report._id} />
                            <ShareReport reportId={report._id} reportName={report.reportName} />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center space-x-3 text-rose-600 animate-in slide-in-from-top-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    <p className="text-xs font-bold leading-tight">{error}</p>
                </div>
            )}
        </div>
    );
}
