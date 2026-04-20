'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { reportService } from '@/services/reportService';
import { Report } from '@/types';

/* ─── Category config ────────────────────────────────────────────────────── */
type CategoryKey = 'Blood Test' | 'Hormone Test' | 'Urine Test' | 'Imaging' | 'Other' | 'default';

const CATEGORY_CONFIG: Record<CategoryKey, { label: string; bg: string; iconColor: string; icon: React.ReactNode }> = {
    'Blood Test': {
        label: 'HEMATOLOGY',
        bg: 'bg-[#FEF3C7]',
        iconColor: '#D97706',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 2a5 5 0 0 1 5 5c0 5-5 11-5 11S7 12 7 7a5 5 0 0 1 5-5z"/>
                <circle cx="12" cy="7" r="2"/>
            </svg>
        ),
    },
    'Hormone Test': {
        label: 'BIOCHEMISTRY',
        bg: 'bg-[#FEE2E2]',
        iconColor: '#DC2626',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
        ),
    },
    'Urine Test': {
        label: 'PATHOLOGY',
        bg: 'bg-[#EDE9FE]',
        iconColor: '#7C3AED',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4m0-6h6m0 0v6m0-6h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4"/>
            </svg>
        ),
    },
    'Imaging': {
        label: 'RADIOLOGY',
        bg: 'bg-[#DBEAFE]',
        iconColor: '#2563EB',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
        ),
    },
    'Other': {
        label: 'GENERAL',
        bg: 'bg-[#F0FDF4]',
        iconColor: '#16A34A',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
        ),
    },
    'default': {
        label: 'REPORT',
        bg: 'bg-[#F3F4F6]',
        iconColor: '#6B7280',
        icon: (
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
            </svg>
        ),
    },
};

function getCategoryConfig(testType?: string) {
    const key = (Object.keys(CATEGORY_CONFIG) as CategoryKey[]).find(
        k => k !== 'default' && testType?.toLowerCase().includes(k.toLowerCase())
    );
    return CATEGORY_CONFIG[key || 'default'];
}

/* ─── Stability badge ────────────────────────────────────────────────────── */
function StabilityBadge({ report }: { report: Report }) {
    const isAbnormal = report.extractedData
        ? Object.values(report.extractedData).some((v: any) => v?.isAbnormal === true)
        : false;

    if (isAbnormal) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[10px] font-black text-[#BE123C] tracking-wide">
                <span className="w-[6px] h-[6px] rounded-full bg-[#F43F5E]" />
                High Priority
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F0FDF4] border border-[#BBF7D0] text-[10px] font-black text-[#15803D] tracking-wide">
            <span className="w-[6px] h-[6px] rounded-full bg-[#22C55E]" />
            Normal Range
        </span>
    );
}

/* ─── Single Report Row Card ─────────────────────────────────────────────── */
function ReportCard({ report }: { report: Report }) {
    const cat    = getCategoryConfig(report.testType);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const refId  = (report as any).lvId || (report._id || '').slice(-8).toUpperCase();

    return (
        <div className="bg-white rounded-[20px] border border-[#EEE9DE] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 px-6 py-5 flex items-center gap-5">

            {/* Category icon square */}
            <div className={`w-14 h-14 rounded-2xl ${cat.bg} flex items-center justify-center shrink-0`} style={{ color: cat.iconColor }}>
                {cat.icon}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-black text-[#1E3A5F] leading-tight mb-1.5">
                    {report.reportName}
                </h3>
                {/* Category badge */}
                <span className="inline-block px-2.5 py-[3px] rounded-full border border-[#E2E8F0] text-[9px] font-black text-[#64748B] tracking-widest uppercase mb-2">
                    {cat.label}
                </span>
                {/* Meta row */}
                <div className="flex flex-col gap-[3px]">
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#64748B] font-medium">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                        {(report as any).patientName || 'You'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#64748B] font-medium">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {report.uploadDate
                            ? new Date(report.uploadDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
                            : '—'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-[#64748B] font-medium">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 7h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
                        </svg>
                        ID: #{refId}
                    </div>
                </div>
            </div>

            {/* Stability */}
            <div className="flex flex-col gap-1 shrink-0 w-[130px]">
                <p className="text-[8.5px] font-black text-[#A0AEC0] tracking-[0.14em] uppercase mb-1">Stability</p>
                <StabilityBadge report={report} />
            </div>

            {/* AI Voice Summary */}
            <div className="flex flex-col gap-1 shrink-0 w-[120px]">
                <p className="text-[8.5px] font-black text-[#A0AEC0] tracking-[0.14em] uppercase mb-1">AI Voice Summary</p>
                <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[9.5px] font-black text-[#334155]">
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        EN
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1.5 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-[9.5px] font-black text-[#334155]">
                        HI
                    </span>
                </div>
            </div>

            {/* Action icons */}
            <div className="flex items-center gap-2.5 shrink-0">
                {/* Lightbulb */}
                <button
                    title="AI Insights"
                    className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#334155] transition-colors flex items-center justify-center"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                        <path d="M9 18h6"/><path d="M10 22h4"/>
                    </svg>
                </button>
                {/* Share */}
                <button
                    title="Share"
                    className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#334155] transition-colors flex items-center justify-center"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                </button>
                {/* Download */}
                <a
                    href={report.fileUrl ? `${apiUrl}${report.fileUrl}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Download PDF"
                    className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#334155] transition-colors flex items-center justify-center"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </a>
            </div>

            {/* View button */}
            <Link
                href={`/dashboard/patient/reports/${report._id}`}
                className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#152C4A] text-white text-[12px] font-black px-5 py-2.5 rounded-full transition-colors shadow-[0_2px_8px_rgba(30,58,95,0.3)] shrink-0"
            >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                View
            </Link>
        </div>
    );
}

/* ─── Filter pills ───────────────────────────────────────────────────────── */
const FILTERS = ['All Reports', 'Hematology', 'Biochemistry', 'Radiology', 'Cardiology'];
const FILTER_MAP: Record<string, string | null> = {
    'All Reports':  null,
    'Hematology':   'Blood Test',
    'Biochemistry': 'Hormone Test',
    'Radiology':    'Imaging',
    'Cardiology':   'Other',
};

const PAGE_SIZE = 3;

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function PatientReportsPage() {
    const { user, loading: authLoading } = useAuth();
    const [reports,  setReports]  = useState<Report[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [filter,   setFilter]   = useState('All Reports');
    const [page,     setPage]     = useState(1);

    useEffect(() => {
        if (authLoading || !user) { if (!authLoading) setLoading(false); return; }
        reportService.getPatientReports()
            .then(data => setReports(Array.isArray(data) ? data : []))
            .catch(() => setReports([]))
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    /* filter */
    const mappedType = FILTER_MAP[filter];
    const filtered = mappedType
        ? reports.filter(r => r.testType === mappedType)
        : reports;

    /* pagination */
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const changeFilter = (f: string) => { setFilter(f); setPage(1); };

    return (
        <div className="space-y-6 pb-10">

            {/* ── Page header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-1">
                        Medical Reports
                    </h1>
                    <p className="text-[13.5px] text-[#64748B] font-medium">
                        Manage and review your clinical documentation.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E2E8F0] bg-white text-[12.5px] font-black text-[#334155] hover:bg-[#F8FAFC] transition-colors shadow-sm">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Export All
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3A5F] hover:bg-[#152C4A] text-white text-[12.5px] font-black transition-colors shadow-[0_2px_8px_rgba(30,58,95,0.25)]">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/>
                            <path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
                        </svg>
                        Upload Report
                    </button>
                </div>
            </div>

            {/* ── Filter pills + sort label ── */}
            <div>
                <div className="flex items-center gap-5 mb-3">
                    <span className="text-[10.5px] font-black text-[#94A3B8] tracking-[0.12em] uppercase shrink-0">
                        Filter by:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                onClick={() => changeFilter(f)}
                                className={`px-4 py-2 rounded-full text-[12px] font-bold border transition-all ${
                                    filter === f
                                        ? 'bg-[#FBBF24] border-[#FBBF24] text-[#1A202C] shadow-sm'
                                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E0]'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end">
                    <span className="text-[11px] text-[#94A3B8] font-medium flex items-center gap-1.5">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
                            <line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>
                        </svg>
                        Sorted by: Recent
                    </span>
                </div>
            </div>

            {/* ── Report list ── */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <div className="w-10 h-10 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                    <p className="text-[13px] text-[#94A3B8] font-medium">Loading your reports…</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[20px] border border-dashed border-[#E2E8F0] py-20 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center">
                        <svg width="28" height="28" fill="none" stroke="#CBD5E0" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-[15px] font-black text-[#1E293B] mb-1">No reports found</p>
                        <p className="text-[12.5px] text-[#94A3B8] font-medium">
                            {filter !== 'All Reports' ? 'Try a different filter.' : 'Reports uploaded by your lab will appear here.'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {paginated.map(r => <ReportCard key={r._id} report={r} />)}
                </div>
            )}

            {/* ── Pagination ── */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between pt-2">
                    <p className="text-[12px] text-[#94A3B8] font-medium">
                        Showing {paginated.length} of {filtered.length} reports
                    </p>
                    <div className="flex items-center gap-1.5">
                        {/* Prev */}
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="15 18 9 12 15 6"/>
                            </svg>
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                className={`w-8 h-8 rounded-full text-[12px] font-black transition-colors ${
                                    page === n
                                        ? 'bg-[#1E3A5F] text-white shadow-sm'
                                        : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                                }`}
                            >
                                {n}
                            </button>
                        ))}

                        {/* Next */}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <polyline points="9 18 15 12 9 6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
