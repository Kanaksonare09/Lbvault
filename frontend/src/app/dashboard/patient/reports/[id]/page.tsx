'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import HealthInsightCard from '@/components/patient/HealthInsightCard';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { reportService } from '@/services/reportService';
import { Report } from '@/types';

export default function PatientReportViewerPage() {
    const { id } = useParams();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'preview' | 'analysis' | 'audio'>('preview');
    const [processingDots, setProcessingDots] = useState('');
    const pollRef = useRef<NodeJS.Timeout | null>(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const fetchReport = useCallback(async () => {
        if (!id) return;
        try {
            const data = await reportService.getReportById(id as string);
            setReport(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load report.');
            return null;
        }
    }, [id]);

    // Animated dots for processing state
    useEffect(() => {
        if (!isProcessing) return;
        const interval = setInterval(() => {
            setProcessingDots(d => d.length >= 3 ? '' : d + '.');
        }, 500);
        return () => clearInterval(interval);
    }, [isProcessing]);

    // Polling: check status every 2s while report is processing
    const startPolling = useCallback(() => {
        if (pollRef.current) return; // already polling
        pollRef.current = setInterval(async () => {
            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch(`${apiBase}/api/reports/${id}/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const statusData = await res.json();

                if (statusData.status === 'ready') {
                    // Stop polling, fetch full report
                    if (pollRef.current) clearInterval(pollRef.current);
                    pollRef.current = null;
                    setIsProcessing(false);
                    const data = await fetchReport();
                    if (data) {
                        setActiveTab('analysis'); // Auto-switch to analysis tab
                    }
                } else if (statusData.status === 'failed') {
                    if (pollRef.current) clearInterval(pollRef.current);
                    pollRef.current = null;
                    setIsProcessing(false);
                    // Still fetch report to show whatever was saved
                    fetchReport();
                }
            } catch (e) {
                // Network error during poll — keep retrying
            }
        }, 2000);
    }, [id, apiBase, fetchReport]);

    // Stop polling on unmount
    useEffect(() => {
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetchReport()
            .then(data => {
                if (data?.status === 'processing') {
                    setIsProcessing(true);
                    startPolling();
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleRegenerate = async () => {
        if (!id) return;
        try {
            setIsRegenerating(true);
            await reportService.getAISummary(id as string, 'en', true);
            const data = await fetchReport();
            if (data) setReport(data);
        } catch (err) {
            console.error('Regeneration failed:', err);
        } finally {
            setIsRegenerating(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-[var(--primary)] border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-500">Loading report…</p>
            </div>
        </div>
    );

    if (error || !report) return (
        <div className="text-center p-20 bg-white rounded-[40px] shadow-sm border border-[var(--border)]">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h3 className="text-xl font-black text-[var(--foreground)] mb-2">{error ?? 'Report not found'}</h3>
            <p className="text-[var(--muted-foreground)] font-medium mb-8">We could not retrieve the requested laboratory report.</p>
            <button onClick={() => router.back()} className="bg-[var(--primary)] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1A202C] transition-all">Go Back</button>
        </div>
    );

    const isPdf = report.fileUrl.toLowerCase().endsWith('.pdf');
    const fullFileUrl = `${apiBase}${report.fileUrl}`;
    const pathologyName = typeof report.pathologyId === 'object' ? report.pathologyId?.name : 'Diagnostic Lab';

    const rawBiomarkers = report.biomarkers || [];

    const biomarkerRows = rawBiomarkers.map((b: any) => {
        const numVal = Number(b.value);
        let status = 'unknown';
        const hasRange = b.referenceMin !== undefined && b.referenceMin !== null && b.referenceMax !== undefined && b.referenceMax !== null;
        if (!isNaN(numVal) && hasRange) {
            status = b.isAbnormal ? (numVal < b.referenceMin ? 'low' : 'high') : 'normal';
        } else if (b.isAbnormal) {
            // Fallback to AI severity if range is missing
            const sev = (b.severity || '').toLowerCase();
            status = sev === 'critical' || sev === 'moderate' || sev === 'mild' ? 'high' : 'unknown';
        } else if (b.isAbnormal === false) {
            status = 'normal';
        }
        return {
            key: b.biomarkerName,
            val: b.value,
            unit: b.unit,
            norm: hasRange ? { min: b.referenceMin, max: b.referenceMax, unit: b.unit } : null,
            status
        };
    });

    const insights = rawBiomarkers.map((b: any) => ({
        label: b.biomarkerName.toLowerCase(),
        value: Number(b.value),
        unit: b.unit,
        ranges: b.referenceMin !== undefined && b.referenceMin !== null && b.referenceMax !== undefined && b.referenceMax !== null
            ? { min: b.referenceMin, max: b.referenceMax }
            : undefined
    }));

    const TABS = [
        { id: 'preview' as const, label: 'File Preview' },
        { id: 'analysis' as const, label: 'AI Analysis' },
        { id: 'audio' as const, label: 'Voice Summary' },
    ];

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-700">
            {/* Processing Banner */}
            {isProcessing && (
                <div className="flex items-center gap-4 bg-gradient-to-r from-[var(--accent)]/60 to-[var(--accent)]/30 border border-[var(--border)] rounded-2xl px-6 py-4">
                    <div className="w-8 h-8 border-[3px] border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin flex-shrink-0" style={{ borderWidth: 3 }} />
                    <div>
                        <p className="font-black text-[var(--primary)] text-sm">🧠 AI is analyzing your report{processingDots}</p>
                        <p className="text-xs text-[var(--primary)] font-medium mt-0.5">This page will automatically update when analysis is complete. No need to refresh.</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-xl transition-colors text-[var(--primary)] border border-transparent hover:border-[var(--border)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                        </button>
                        <h1 className="text-whitexl font-black text-[var(--foreground)] tracking-tight">{report.reportName}</h1>
                        {report.aiSummary && !isProcessing && (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">AI Ready</span>
                        )}
                        {isProcessing && (
                            <span className="text-[10px] font-black text-[var(--primary)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-full border border-[var(--border)] uppercase tracking-widest animate-pulse">Analyzing…</span>
                        )}
                    </div>
                    <p className="text-[var(--muted-foreground)] text-sm font-bold uppercase tracking-widest flex items-center gap-2 pl-10">
                        <span className="w-2 h-2 bg-[var(--secondary)] rounded-full" />
                        {pathologyName} · {report.testType || report.category || 'Lab Report'} · {(() => { const d = report.reportDate || report.createdAt; return d ? new Date(d).toLocaleDateString() : 'N/A'; })()}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button onClick={handleRegenerate} disabled={isRegenerating || isProcessing}
                        className="flex items-center gap-2 bg-[#F4F6F9] text-gray-600 border border-[var(--border)] px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white hover:shadow-md transition-all disabled:opacity-50">
                        {isRegenerating
                            ? <div className="w-4 h-4 border-[var(--primary)] border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin" />
                            : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" /></svg>
                        }
                        {isRegenerating ? 'Re-scanning…' : 'Re-scan'}
                    </button>
                    <a href={fullFileUrl} download className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#1A202C] transition-all shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                        Download {isPdf ? 'PDF' : 'Report'}
                    </a>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white border border-[var(--border)] p-1 rounded-2xl w-fit shadow-sm">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* FILE PREVIEW TAB */}
            {activeTab === 'preview' && (
                <div className="bg-white rounded-[40px] shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 bg-[var(--background)] border-b border-[var(--border)] flex justify-between items-center">
                        <span className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest">{isPdf ? 'PDF Document Preview' : 'Image Preview'}</span>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-400" />
                            <div className="w-3 h-3 rounded-full bg-amber-400" />
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                        </div>
                    </div>
                    <div className="bg-[#DEE2E6] flex items-center justify-center p-4 min-h-[500px]">
                        {isPdf
                            ? <iframe src={`${fullFileUrl}#toolbar=0`} className="w-full min-h-[600px] border-[var(--primary)] rounded-lg shadow-2xl" title="Report PDF" />
                            : <img src={fullFileUrl} alt={report.reportName} className="max-w-full rounded-lg shadow-2xl hover:scale-[1.02] transition-transform duration-300" />
                        }
                    </div>
                </div>
            )}

            {/* AI ANALYSIS TAB */}
            {activeTab === 'analysis' && (
                <div className="space-y-6">
                    {/* Processing placeholder */}
                    {isProcessing && (
                        <div className="bg-gradient-to-br from-[var(--accent-soft)] to-white p-8 rounded-3xl border border-dashed border-[var(--border)]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-[var(--accent)] rounded-2xl flex items-center justify-center">
                                    <div className="w-5 h-5 border-[var(--primary)] border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">AI Engine Running</p>
                                    <p className="text-[10px] text-[var(--primary)] font-medium mt-0.5">OCR → Biomarker Extraction → Summary Generation{processingDots}</p>
                                </div>
                            </div>
                            {/* Skeleton loaders */}
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-[var(--border)] rounded-full w-3/4" />
                                <div className="h-4 bg-[var(--border)] rounded-full w-full" />
                                <div className="h-4 bg-[var(--border)] rounded-full w-5/6" />
                                <div className="h-4 bg-[var(--border)] rounded-full w-2/3" />
                            </div>
                        </div>
                    )}

                    {/* AI Summary */}
                    {report.aiSummary && !isProcessing && (
                        <div className="bg-gradient-to-br from-[var(--accent-soft)] to-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 bg-[var(--accent)] rounded-2xl flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">AI-Generated Summary</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-pulse" />
                                        <span className="text-[10px] font-bold text-[var(--primary)]">Processed by HealthScan AI</span>
                                    </div>
                                </div>
                            </div>
                            <div
                                className="text-gray-700 font-medium leading-relaxed text-base whitespace-pre-line"
                                dangerouslySetInnerHTML={{ __html: report.aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                            />
                        </div>
                    )}

                    {/* Biomarker Table */}
                    {biomarkerRows.length > 0 && !isProcessing && (
                        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-[var(--background)]">
                                <h3 className="text-lg font-black text-[var(--foreground)]">Biomarker Results</h3>
                                <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">Extracted from your lab report</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[var(--background)]">
                                        <tr>
                                            {['Biomarker', 'Your Value', 'Normal Range', 'Status'].map(h => (
                                                <th key={h} className="px-6 py-4 text-left text-xs font-black text-[var(--muted-foreground)] uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--background)]">
                                        {biomarkerRows.map(({ key, val, norm, status }) => (
                                            <tr key={key} className="hover:bg-[var(--background)] transition-colors">
                                                <td className="px-6 py-4 font-black text-[var(--foreground)] text-sm capitalize">{key}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-black text-lg ${status === 'normal' ? 'text-[var(--primary)]' : status === 'low' ? 'text-[var(--primary)]' : status === 'high' ? 'text-rose-600' : 'text-[var(--foreground)]'}`}>
                                                        {typeof val === 'number' ? val.toLocaleString() : String(val)}
                                                    </span>
                                                    {norm && <span className="text-xs text-[var(--muted-foreground)] ml-1">{norm.unit}</span>}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[var(--muted-foreground)] font-medium">
                                                    {norm ? `${norm.min} – ${norm.max} ${norm.unit}` : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {status === 'normal' && (
                                                        <span className="text-[10px] font-black text-[var(--primary)] bg-[var(--accent)] border border-[var(--border)] px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />Normal
                                                        </span>
                                                    )}
                                                    {status === 'high' && (
                                                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />High
                                                        </span>
                                                    )}
                                                    {status === 'low' && (
                                                        <span className="text-[10px] font-black text-[var(--primary)] bg-[var(--accent-soft)] border border-[var(--border)] px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-soft)]0" />Low
                                                        </span>
                                                    )}
                                                    {status === 'unknown' && <span className="text-[10px] font-bold text-[#94A3B8]">—</span>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Insight Gauge Cards */}
                    {insights.length > 0 && !isProcessing && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {insights.map((insight, idx) => (
                                <HealthInsightCard key={idx} label={insight.label} value={insight.value} unit={insight.unit} ranges={insight.ranges} />
                            ))}
                        </div>
                    )}

                    {/* Doctor Comment */}
                    {report.doctorComment && !isProcessing && (
                        <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-[var(--background)] rounded-full flex items-center justify-center border border-[var(--border)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                                </div>
                                <h3 className="text-lg font-black text-[var(--foreground)]">Doctor&apos;s Clinical Review</h3>
                            </div>
                            <div className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)]">
                                <p className="text-[var(--primary)] italic font-medium leading-relaxed">&ldquo;{report.doctorComment}&rdquo;</p>
                            </div>
                        </div>
                    )}

                    {insights.length === 0 && !report.aiSummary && !isProcessing && (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-[var(--border)] text-center">
                            <p className="text-[var(--muted-foreground)] font-bold">No biomarkers extracted yet.</p>
                            <p className="text-xs text-[#94A3B8] mt-1">Click Re-scan above to trigger AI analysis.</p>
                        </div>
                    )}
                </div>
            )}

            {/* VOICE SUMMARY TAB */}
            {activeTab === 'audio' && (
                <div className="max-w-2xl mx-auto">
                    <AudioPlayer reportId={report._id} reportName={report.reportName} />
                </div>
            )}
        </div>
    );
}
