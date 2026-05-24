'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/services/api';
import { useAuth } from '@/lib/AuthContext';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';
import Link from 'next/link';

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS = ['All Reports', 'Hematology', 'Biochemistry', 'Radiology', 'Cardiology'];

// ─── Per-report icon (square, rounded) ───────────────────────────────────────
const ICON_CONFIGS = [
    {
        bg: 'bg-[var(--accent-soft)]',
        color: 'text-[var(--primary)]',
        icon: (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2C6 2 2 12 2 12s4 10 10 10 10-10 10-10S18 2 12 2z" /><circle cx="12" cy="12" r="3" />
            </svg>
        ),
    },
    {
        bg: 'bg-red-50',
        color: 'text-red-400',
        icon: (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
    {
        bg: 'bg-indigo-50',
        color: 'text-indigo-400',
        icon: (
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
        ),
    },
];

// ─── Stability status from biomarkers ────────────────────────────────────────
function getStabilityStatus(report: any): { label: string; isHigh: boolean } {
    const hasCritical = Object.values(report.extractedData || {}).some(
        (b: any) => typeof b === 'object' && (b.severity === 'Critical' || b.isAbnormal)
    );
    if (hasCritical) return { label: 'High Priority', isHigh: true };
    return { label: 'Normal Range', isHigh: false };
}

// ─── Category tag pill colour ─────────────────────────────────────────────────
function getCategoryStyle(testType: string) {
    const t = (testType || '').toLowerCase();
    if (t.includes('hemat') || t.includes('blood') || t.includes('cbc')) return 'text-[var(--primary)] bg-[var(--accent-soft)] border border-[var(--border)]';
    if (t.includes('bio') || t.includes('glucose') || t.includes('lipid')) return 'text-pink-700 bg-pink-50 border border-pink-200';
    if (t.includes('radio') || t.includes('x-ray') || t.includes('xray') || t.includes('chest')) return 'text-violet-700 bg-violet-50 border border-violet-200';
    if (t.includes('cardio') || t.includes('heart')) return 'text-blue-700 bg-[var(--accent-soft)] border border-blue-200';
    return 'text-gray-600 bg-gray-50 border border-gray-200';
}

function getCategoryLabel(testType: string) {
    const t = (testType || '').toLowerCase();
    if (t.includes('hemat') || t.includes('blood') || t.includes('cbc')) return 'Hematology';
    if (t.includes('bio') || t.includes('glucose') || t.includes('lipid')) return 'Biochemistry';
    if (t.includes('radio') || t.includes('x-ray') || t.includes('xray') || t.includes('chest')) return 'Radiology';
    if (t.includes('cardio') || t.includes('heart')) return 'Cardiology';
    return testType || 'Report';
}

// ─── Biomarker row status ─────────────────────────────────────────────────────
function getBioStatus(key: string, val: any) {
    if (val && typeof val === 'object' && val.hasOwnProperty('value')) {
        if (val.isAbnormal) {
            const sev = val.severity || 'Abnormal';
            if (sev === 'Critical') return { label: 'CRITICAL', cls: 'bg-red-100 text-red-700 border border-red-200 text-[9px] font-black px-2 py-0.5 rounded tracking-widest' };
            return { label: 'MODERATE', cls: 'bg-orange-50 text-orange-600 border border-orange-200 text-[9px] font-bold px-2 py-0.5 rounded tracking-widest' };
        }
        return { label: 'NORMAL', cls: 'bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded tracking-widest' };
    }
    return { label: 'NORMAL', cls: 'bg-green-50 text-green-700 border border-green-200 text-[9px] font-bold px-2 py-0.5 rounded tracking-widest' };
}

// ─── Share Popover (position: fixed so overflow:hidden can't clip it) ────────
function SharePopover({ report }: { report: any }) {
    const [open, setOpen]     = useState(false);
    const [copied, setCopied] = useState(false);
    const [pos, setPos]       = useState({ top: 0, right: 0 });
    const btnRef              = useRef<HTMLButtonElement>(null);
    const menuRef             = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const h = (e: MouseEvent) => {
            if (
                btnRef.current  && !btnRef.current.contains(e.target as Node) &&
                menuRef.current && !menuRef.current.contains(e.target as Node)
            ) setOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleOpen = () => {
        if (btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            // Place menu above the button, aligned to its right edge
            setPos({ top: r.top - 8, right: window.innerWidth - r.right });
        }
        setOpen(o => !o);
    };

    const reportLink = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/doctor/shared-reports` : '';
    const reportText = `Medical Report: ${report.reportName || 'Clinical Report'}`;
    const apiBase    = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const fileUrl    = report.fileUrl ? `${apiBase}${report.fileUrl}` : reportLink;

    const channels = [
        {
            id: 'wa',
            label: 'WhatsApp',
            color: '#25D366',
            go: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(reportText + '\n' + fileUrl)}`, '_blank'),
        },
        {
            id: 'em',
            label: 'Email',
            color: '#EA4335',
            // Use location.href for mailto — window.open is blocked by popup blockers
            go: () => { window.location.href = `mailto:?subject=${encodeURIComponent(reportText)}&body=${encodeURIComponent(fileUrl)}`; },
        },
        {
            id: 'tg',
            label: 'Telegram',
            color: '#2AABEE',
            go: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(fileUrl)}&text=${encodeURIComponent(reportText)}`, '_blank'),
        },
    ];

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleOpen}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] transition-colors"
                title="Share Report"
            >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
            </button>

            {/* Fixed-position menu — escapes overflow:hidden parent entirely */}
            {open && (
                <div
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top:   pos.top,
                        right: pos.right,
                        zIndex: 9999,
                        transform: 'translateY(-100%)',
                    }}
                    className="w-[200px] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden"
                >
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-[9.5px] font-black text-gray-400 uppercase tracking-[0.14em]">Share via</p>
                        <p className="text-[11.5px] font-bold text-gray-800 truncate mt-0.5">{report.reportName}</p>
                    </div>
                    <div className="py-1.5">
                        {channels.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => { ch.go(); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                            >
                                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0" style={{ background: ch.color }}>
                                    {ch.label[0]}
                                </span>
                                <span className="text-[12.5px] font-semibold text-gray-700">{ch.label}</span>
                            </button>
                        ))}
                        <div className="h-px bg-gray-100 mx-3 my-1" />
                        <button
                            onClick={async () => {
                                try { await navigator.clipboard.writeText(fileUrl); }
                                catch { /* fallback */ }
                                setCopied(true);
                                setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                        >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shrink-0 ${
                                copied ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-gray-100 text-gray-500'
                            }`}>
                                {copied ? '✓' : '🔗'}
                            </span>
                            <span className={`text-[12.5px] font-semibold ${copied ? 'text-[var(--primary)]' : 'text-gray-700'}`}>
                                {copied ? 'Copied!' : 'Copy Link'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
export default function DoctorSharedReportsPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All Reports');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');
    const [savingNote, setSavingNote] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 3;

    // Safe date formatter — never shows "Invalid Date"
    const fmt = (d: any) => {
        const date = new Date(d);
        if (!d || isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    useEffect(() => {
        api.get('/doctor/shared-reports')
            .then(res => setReports(res.data || []))
            .catch(() => setReports([]))
            .finally(() => setLoading(false));
    }, []);

    const saveNote = async (reportId: string) => {
        if (!noteText.trim()) return;
        setSavingNote(reportId);
        try {
            await api.post(`/doctor/reports/${reportId}/note`, { note: noteText });
            setNoteText('');
            const res = await api.get('/doctor/shared-reports');
            setReports(res.data || []);
        } catch (err) { console.error(err); }
        finally { setSavingNote(null); }
    };

    const filtered = reports.filter(r => {
        if (activeFilter === 'All Reports') return true;
        if (activeFilter === 'Urgent Review') return !r.doctorComment;
        const cat = getCategoryLabel(r.testType || r.category || '');
        return cat.toLowerCase() === activeFilter.toLowerCase();
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <div className="max-w-[860px] mx-auto">

            {/* ── Page Title + Buttons ─────────────────────────────────────────── */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Medical Reports</h1>
                    <p className="text-[13.5px] text-gray-400 font-medium mt-1">Manage and review patient clinical documentation.</p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                    {/* Export All — downloads CSV */}
                    <button
                        onClick={() => {
                            const rows = [['Report Name','Patient','Date','Category','Status'],
                                ...reports.map(r => [
                                    r.reportName || '',
                                    typeof r.patientId === 'object' ? r.patientId?.name : '',
                                    new Date(r.uploadDate || r.createdAt).toLocaleDateString('en-IN'),
                                    getCategoryLabel(r.testType || r.category || ''),
                                    r.doctorComment ? 'Reviewed' : 'Pending',
                                ])
                            ];
                            const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = 'medical_reports.csv'; a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 bg-white text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export All
                    </button>
                </div>
            </div>

            {/* ── Filter Bar ───────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2.5 mb-5 flex-wrap">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mr-1">Filter By:</span>
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveFilter(tab); setCurrentPage(1); }}
                        className={`text-[12.5px] font-semibold px-4 py-1.5 rounded-full transition-all border ${activeFilter === tab
                            ? 'bg-[var(--accent)] text-[var(--primary)] border-[#F0D96A] shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
                <span className="ml-auto text-[11.5px] text-gray-400 flex items-center gap-1.5 font-medium">
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                    Sorted by: Recent
                </span>
            </div>

            {/* ── Report Cards ─────────────────────────────────────────────────── */}
            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="w-9 h-9 border-[3px] border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center shadow-sm">
                    <p className="text-[14px] font-bold text-gray-400">No reports found</p>
                    <p className="text-[12px] text-gray-300 mt-1">Reports shared by patients will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {paginated.map((report, idx) => {
                        const patientName = typeof report.patientId === 'object' ? report.patientId?.name : 'Unknown Patient';
                        const date = fmt(report.uploadDate || report.createdAt);
                        const refNum = `#${getCategoryLabel(report.testType || '').substring(0, 3).toUpperCase()}-${String(report._id).slice(-4).toUpperCase()}`;
                        const { label: stabilityLabel, isHigh } = getStabilityStatus(report);
                        const catLabel = getCategoryLabel(report.testType || report.category || '');
                        const catStyle = getCategoryStyle(report.testType || report.category || '');
                        const iconCfg = ICON_CONFIGS[idx % ICON_CONFIGS.length];
                        const isExpanded = expanded === report._id;

                        return (
                            <div key={report._id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] overflow-hidden">
                                {/* ── Card Row ── */}
                                <div className="flex items-center px-5 py-4 gap-4">

                                    {/* Icon */}
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconCfg.bg} ${iconCfg.color}`}>
                                        {iconCfg.icon}
                                    </div>

                                    {/* Report info ─ grows to fill available space */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <h3 className="text-[14px] font-black text-blue-700 truncate leading-tight">
                                            {report.reportName}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${catStyle}`}>{catLabel}</span>
                                            <span className="text-[11px] text-gray-400 font-medium">{patientName}</span>
                                            <span className="text-gray-200">·</span>
                                            <span className="text-[11px] text-gray-400 font-medium">{fmt(report.uploadDate || report.createdAt)}</span>
                                            <span className="text-gray-200">·</span>
                                            <span className="text-[11px] text-gray-400 font-medium">{refNum}</span>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-8 bg-gray-100 shrink-0" />

                                    {/* Stability */}
                                    <div className="shrink-0">
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Stability</p>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                                            isHigh ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isHigh ? 'bg-red-500' : 'bg-green-500'}`} />
                                            {stabilityLabel}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-8 bg-gray-100 shrink-0" />

                                    {/* Voice — compact EN/HI + speaker */}
                                    <div className="shrink-0">
                                        <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1.5">Voice</p>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex rounded-md border border-gray-200 overflow-hidden text-[9px] font-black">
                                                <button
                                                    onClick={() => setReports(prev => prev.map(r => r._id === report._id ? { ...r, _voiceLang: 'en' } : r))}
                                                    className={`px-2 py-1 transition-colors ${
                                                        (report._voiceLang ?? 'en') === 'en' ? 'bg-gray-800 text-white' : 'bg-white text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >EN</button>
                                                <button
                                                    onClick={() => setReports(prev => prev.map(r => r._id === report._id ? { ...r, _voiceLang: 'hi' } : r))}
                                                    className={`px-2 py-1 transition-colors ${
                                                        (report._voiceLang ?? 'en') === 'hi' ? 'bg-gray-800 text-white' : 'bg-white text-gray-400 hover:text-gray-600'
                                                    }`}
                                                >HI</button>
                                            </div>
                                            <VoiceSummaryButton
                                                reportId={report._id}
                                                lang={report._voiceLang ?? 'en'}
                                                compact={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="w-px h-8 bg-gray-100 shrink-0" />

                                    {/* Action icons */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* Insights */}
                                        {(() => {
                                            const pid = typeof report.patientId === 'object' ? report.patientId?._id : report.patientId;
                                            return pid ? (
                                                <Link href={`/dashboard/doctor/patient/${pid}/dashboard`}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-[var(--primary)] hover:bg-[var(--accent-soft)] transition-colors"
                                                    title="View Patient Insights">
                                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                                                </Link>
                                            ) : null;
                                        })()}
                                        {/* Share */}
                                        <SharePopover report={report} />
                                        {/* Download */}
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                            title="Download Report"
                                        >
                                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                        </a>
                                        {/* View */}
                                        <button
                                            onClick={() => setExpanded(isExpanded ? null : report._id)}
                                            className="flex items-center gap-1.5 bg-[var(--primary)] hover:bg-blue-700 text-white text-[12px] font-bold px-3.5 py-1.5 rounded-full transition-colors"
                                        >
                                            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                            {isExpanded ? 'Close' : 'View'}
                                        </button>
                                    </div>
                                </div>

                                {/* ── Expanded Panel ── */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                            {/* AI Insight */}
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                <div className="flex items-center gap-2 px-5 py-3 bg-gray-900">
                                                    <svg width="12" height="12" fill="none" stroke="var(--accent)" strokeWidth="2.5" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                                    <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">AI Clinical Insight</span>
                                                </div>
                                                <div className="px-5 py-4">
                                                    {report.aiSummary ? (
                                                        <p className="text-[12.5px] text-gray-600 leading-relaxed"
                                                            dangerouslySetInnerHTML={{ __html: report.aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').slice(0, 400) + (report.aiSummary.length > 400 ? '…' : '') }}
                                                        />
                                                    ) : (
                                                        <p className="text-[12.5px] text-gray-400 italic">Analysis pending — AI model is processing this report.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Biomarker Table */}
                                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                                <div className="grid grid-cols-4 px-5 py-3 border-b border-gray-100">
                                                    {['Biomarker', 'Result', 'Reference', 'Status'].map(h => (
                                                        <span key={h} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{h}</span>
                                                    ))}
                                                </div>
                                                {report.extractedData && Object.keys(report.extractedData).length > 0 ? (
                                                    <div className="divide-y divide-gray-50">
                                                        {Object.entries(report.extractedData).slice(0, 8).map(([key, val]: [string, any]) => {
                                                            const bs = getBioStatus(key, val);
                                                            const isRich = typeof val === 'object' && val !== null;
                                                            const displayVal = isRich ? `${val.value} ${val.unit}` : val;
                                                            const range = isRich && (val.min !== undefined || val.max !== undefined) ? `${val.min ?? '0'}–${val.max ?? '∞'}` : '—';
                                                            return (
                                                                <div key={key} className="grid grid-cols-4 px-5 py-3 items-center hover:bg-gray-50 transition-colors">
                                                                    <span className="text-[12px] text-gray-700 font-medium truncate pr-2">{key}</span>
                                                                    <span className="text-[12px] font-bold text-gray-900 truncate pr-2">{displayVal}</span>
                                                                    <span className="text-[11px] text-gray-400 truncate pr-2">{range}</span>
                                                                    <span className={bs.cls}>{bs.label}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="px-5 py-8 text-center">
                                                        <p className="text-[12px] text-gray-400 italic">No structured biomarker data extracted.</p>
                                                    </div>
                                                )}

                                                {/* Clinical Note */}
                                                <div className="px-5 py-4 border-t border-gray-100">
                                                    {report.doctorComment && (
                                                        <div className="mb-3 px-3 py-2 bg-[var(--accent-soft)] rounded-xl border border-[var(--border)]">
                                                            <p className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest mb-0.5">Clinical Note</p>
                                                            <p className="text-[12px] text-gray-700 italic">"{report.doctorComment}"</p>
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Add clinical note…"
                                                            value={savingNote === report._id ? '' : noteText}
                                                            onChange={e => setNoteText(e.target.value)}
                                                            onKeyDown={e => e.key === 'Enter' && saveNote(report._id)}
                                                            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] outline-none focus:border-blue-300 transition-colors"
                                                        />
                                                        <button
                                                            onClick={() => saveNote(report._id)}
                                                            disabled={savingNote === report._id}
                                                            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-[12px] font-semibold rounded-xl transition-colors disabled:opacity-50"
                                                        >
                                                            {savingNote === report._id ? '…' : 'Save'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Pagination ───────────────────────────────────────────────────── */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between mt-8">
                    <p className="text-[12.5px] text-gray-400 font-medium">
                        Showing {Math.min(paginated.length, PAGE_SIZE)} of {filtered.length} reports
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all disabled:opacity-40 bg-white"
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-9 h-9 rounded-full text-[13px] font-bold transition-all ${page === currentPage
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800 bg-white'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all disabled:opacity-40 bg-white"
                        >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
