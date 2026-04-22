'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { reportService } from '@/services/reportService';
import { patientService } from '@/services/patientService';
import { Report } from '@/types';
import Link from 'next/link';
import AccessManagement from '@/components/patient/features/AccessManagement';
import UploadModal from '@/components/ui/UploadModal';
import api from '@/services/api';

/** Map biomarker name → insight config */
const BM_INSIGHT_MAP: Record<string, { title: string; bgColor: string; stroke: string; desc: string }> = {
    creatinine:   { title: 'Kidney Filtration',      bgColor: '#EEF2FD', stroke: 'var(--primary)', desc: 'Creatinine levels indicate kidney function. Stay hydrated for optimal filtration.' },
    hba1c:        { title: 'Glycemic Control',        bgColor: '#FDF4FF', stroke: '#D946EF', desc: 'Long-term glucose control. Monitor your carbohydrate intake to keep it stable.' },
    'vitamin d':  { title: 'Nutritional Levels',     bgColor: 'var(--accent)', stroke: 'var(--primary)', desc: 'Vitamin D is essential for bone health and immunity. Ensure adequate sunlight.' },
    cholesterol:  { title: 'Cardiovascular Health',  bgColor: '#EEF2FD', stroke: 'var(--primary)', desc: 'Saturated fat reduction is key for maintaining healthy lipid profiles.' },
    hdl:          { title: 'Cardiovascular Health',  bgColor: '#EEF2FD', stroke: 'var(--primary)', desc: 'HDL is the good cholesterol. Regular aerobic exercise supports healthy levels.' },
    ldl:          { title: 'Cardiovascular Health',  bgColor: '#EEF2FD', stroke: 'var(--primary)', desc: 'LDL cholesterol management is critical for heart health.' },
    triglycerides:{ title: 'Lipid Balance',          bgColor: 'var(--accent-soft)', stroke: 'var(--primary)', desc: 'Elevated triglycerides are linked to metabolic syndrome. Reduce refined sugars.' },
    crp:          { title: 'Inflammation Markers',   bgColor: '#F7F8FA', stroke: 'var(--primary)', desc: 'C-reactive protein tracks systemic inflammation. Omega-3s can help.' },
    tsh:          { title: 'Thyroid Function',       bgColor: '#FDF4FF', stroke: '#D946EF', desc: 'TSH manages metabolic rate. Consult your endocrinologist for unusual fatigue.' },
    hemoglobin:   { title: 'Oxygen Carrying Capacity', bgColor: '#FFF0F5', stroke: '#EC4899', desc: 'Hemoglobin carries oxygen in blood. Low values may indicate anaemia.' },
    glucose:      { title: 'Blood Sugar',            bgColor: 'var(--accent-soft)', stroke: 'var(--primary)', desc: 'Fasting glucose reflects metabolic health. Maintain a balanced carb intake.' },
    urea:         { title: 'Kidney Health',          bgColor: '#EEF2FD', stroke: 'var(--primary)', desc: 'Elevated urea can signal reduced kidney clearance. Stay well-hydrated.' },
    insulin:      { title: 'Insulin Sensitivity',   bgColor: '#FDF4FF', stroke: '#8B5CF6', desc: 'Insulin resistance precedes diabetes. Exercise improves sensitivity.' },
};

/** Build dynamic insight cards from the analytics latestSnapshot */
function buildInsightsFromSnapshot(snapshot: any[]): Array<{ title: string; bg: string; stroke: string; desc: string }> {
    if (!snapshot || snapshot.length === 0) return [];
    const seen = new Set<string>();
    const cards: any[] = [];
    // Prioritise abnormal/critical items first
    const sorted = [...snapshot].sort((a, b) => {
        const order: Record<string, number> = { Critical: 0, Moderate: 1, Mild: 2, Normal: 3 };
        return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
    });
    for (const bm of sorted) {
        const key = Object.keys(BM_INSIGHT_MAP).find(k => (bm.name || '').toLowerCase().includes(k));
        if (key && !seen.has(BM_INSIGHT_MAP[key].title)) {
            seen.add(BM_INSIGHT_MAP[key].title);
            const cfg = BM_INSIGHT_MAP[key];
            // Personalise description with actual values when available
            const valNote = bm.value ? ` (Latest: ${bm.value}${bm.unit ? ' ' + bm.unit : ''})` : '';
            cards.push({ title: cfg.title, bg: cfg.bgColor, stroke: cfg.stroke, desc: cfg.desc + valNote });
        }
        if (cards.length >= 2) break;
    }
    return cards;
}

export default function PatientDashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [accessList, setAccessList] = useState<any[]>([]);
    const [analyticsSnapshot, setAnalyticsSnapshot] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const id = user?.id || user?._id;
                const [data, access, analytics] = await Promise.all([
                    reportService.getPatientReports(),
                    patientService.getAccessList().catch(() => []),
                    id ? api.get(`/analytics/${id}`).then(r => r.data).catch(() => null) : Promise.resolve(null),
                ]);
                setReports(Array.isArray(data) ? data : []);
                setAccessList(Array.isArray(access) ? access : []);
                if (analytics?.latestSnapshot?.length) {
                    setAnalyticsSnapshot(analytics.latestSnapshot);
                }
            } catch { setReports([]); setAccessList([]); }
            finally { setLoading(false); }
        };
        if (!authLoading) {
            if (user?.id || user?._id) fetchData();
            else setLoading(false);
        }
    }, [user, authLoading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-8 h-8 border-[3px] border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin" />
            </div>
        );
    }

    const reportsList = Array.isArray(reports) ? reports : [];

    // Build dynamic insights: prefer analytics snapshot, fall back to report biomarkers
    const latestReport = reportsList.length > 0 ? reportsList[0] : null;
    const insights = analyticsSnapshot.length > 0
        ? buildInsightsFromSnapshot(analyticsSnapshot)
        : buildInsightsFromSnapshot(
            (latestReport?.biomarkers || []).map((b: any) => ({ name: b.biomarkerName, value: b.value, unit: b.unit, severity: b.isAbnormal ? 'Moderate' : 'Normal' }))
          );

    // Compute real analyzed count from reports with aiSummary
    const analyzedCount = reportsList.filter(r => (r as any).aiSummary).length;
    const analyzedPct = reportsList.length > 0 ? Math.round((analyzedCount / reportsList.length) * 100) : 0;

    return (
        <div className="max-w-[1080px] mx-auto space-y-5">

            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={() => {
                        setShowUpload(false);
                        reportService.getPatientReports().then(d => setReports(Array.isArray(d) ? d : []));
                    }}
                />
            )}

            {/* ════════════════════════════════
                1. YELLOW HERO CARD
            ════════════════════════════════ */}
            <div className="bg-[var(--accent)] rounded-[32px] px-10 py-9 flex items-center justify-between gap-6">

                {/* Left */}
                <div className="flex-1">
                    {/* Verified pill */}
                    <div className="inline-flex items-center gap-2 bg-white/60 border border-white/80 rounded-full px-3 py-1 mb-5">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--primary)">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span className="text-[9px] font-extrabold text-[var(--primary)] uppercase tracking-[0.16em]">Verified Profile</span>
                    </div>

                    {/* Name */}
                    <h1 className="text-[40px] font-black text-[var(--foreground)] leading-[1.1] tracking-tight mb-3">
                        Welcome back,<br />{user?.name || 'Alexander Pierce'}
                    </h1>
                    <p className="text-[13.5px] text-[var(--primary)] font-medium leading-relaxed max-w-sm">
                        Your health data is synchronized and up-to-date. We&apos;ve analyzed{' '}
                        {reportsList.length > 0 ? reportsList.length : 3} new reports since your last visit.
                    </p>
                </div>

                {/* Right — two stacked buttons */}
                <div className="flex flex-col gap-3 shrink-0 w-[175px]">
                    <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center justify-center gap-2.5 bg-[var(--primary)] hover:bg-[var(--primary)] text-white font-bold text-[14px] py-4 rounded-2xl transition-colors shadow-sm"
                    >
                        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload Report
                    </button>
                    <Link
                        href="/dashboard/patient/reports"
                        className="flex items-center justify-center bg-white hover:bg-gray-50 text-[var(--foreground)] font-semibold text-[14px] py-4 rounded-2xl transition-colors text-center"
                    >
                        View History
                    </Link>
                </div>
            </div>

            {/* ════════════════════════════════
                2. MIDDLE: INSIGHTS + STATS
            ════════════════════════════════ */}
            <div className="flex gap-5 items-stretch">

                {/* LEFT — Health Trends Insight (white card) */}
                <div className="flex-[1.4] bg-white rounded-[28px] p-8 flex flex-col border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">

                    {/* Header row */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.18em] mb-1">AI Analysis Engine</p>
                            <h2 className="text-[22px] font-black text-gray-900 tracking-tight">Health Trends Insight</h2>
                        </div>
                        <div className="w-10 h-10 bg-[var(--accent-soft)] rounded-full flex items-center justify-center shrink-0">
                            <svg width="18" height="18" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                                <path d="M2 12h20"/>
                            </svg>
                        </div>
                    </div>

                    {/* Dynamic insight sub-cards */}
                    <div className="flex gap-4 flex-1 mb-7">
                        {insights.length > 0 ? insights.map((insight, i) => (
                            <div key={i} className="flex-1 rounded-2xl p-5" style={{ backgroundColor: insight.bg }}>
                                <div className="flex items-center gap-2.5 mb-3">
                                    <svg width="18" height="18" fill="none" stroke={insight.stroke} strokeWidth="2.5" viewBox="0 0 24 24">
                                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                        <polyline points="16 7 22 7 22 13" />
                                    </svg>
                                    <span className="text-[13.5px] font-black text-gray-900 leading-tight">
                                        {insight.title.split(' ')[0]}<br />{insight.title.split(' ').slice(1).join(' ')}
                                    </span>
                                </div>
                                <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                                    {insight.desc}
                                </p>
                            </div>
                        )) : (
                            <>
                                {/* Fallback 1: Cardiovascular */}
                                <div className="flex-1 bg-[#EEF2FD] rounded-2xl p-5">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <svg width="18" height="18" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                                            <polyline points="16 7 22 7 22 13" />
                                        </svg>
                                        <span className="text-[13.5px] font-black text-gray-900 leading-tight">Cardiovascular<br />Efficiency</span>
                                    </div>
                                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                                        Your heart rate variability shows a 12% improvement over the last 30 days, suggesting excellent recovery cycles.
                                    </p>
                                </div>

                                {/* Fallback 2: Inflammation */}
                                <div className="flex-1 bg-[#F7F8FA] rounded-2xl p-5">
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <svg width="18" height="18" fill="none" stroke="var(--primary)" strokeWidth="2.5" viewBox="0 0 24 24">
                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                            <line x1="12" y1="9" x2="12" y2="13" />
                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                        </svg>
                                        <span className="text-[13.5px] font-black text-gray-900 leading-tight">Inflammation<br />Markers</span>
                                    </div>
                                    <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                                        Maintain your current antioxidant intake to manage general systemic inflammation levels.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom row */}
                    <div className="flex items-center justify-between">
                        {/* Avatars */}
                        <div className="flex -space-x-2.5">
                            <img src="https://i.pravatar.cc/100?img=11" alt="" className="w-8 h-8 rounded-full border-[var(--primary)] border-white object-cover" />
                            <img src="https://i.pravatar.cc/100?img=12" alt="" className="w-8 h-8 rounded-full border-[var(--primary)] border-white object-cover" />
                            <div className="w-8 h-8 rounded-full border-[var(--primary)] border-white bg-[var(--accent)] flex items-center justify-center z-10">
                                <span className="text-[9px] font-black text-[var(--primary)]">AI</span>
                            </div>
                        </div>
                        <Link href="/dashboard/patient/analytics" className="flex items-center gap-1 text-[12.5px] font-bold text-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                            Read Detailed Analysis
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </Link>
                    </div>
                </div>

                {/* RIGHT — Stats column */}
                <div className="flex-1 flex flex-col gap-4">

                    {/* LV-ID */}
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">LV-ID</span>
                            <svg width="16" height="16" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <p className="text-[20px] font-black text-gray-900 tracking-tight mt-1">
                            {(user?.id || user?._id || 'HS882901X').toString().slice(-9).toUpperCase().replace(/(.{2})(.{4})(.{3})/, 'HS-$2-$3')}
                        </p>
                        <p className="text-[11px] font-semibold text-[var(--primary)] mt-0.5">Active Member</p>
                    </div>

                    {/* Total Reports */}
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Reports</span>
                            <svg width="16" height="16" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <p className="text-[32px] font-black text-gray-900 leading-none mb-3">
                            {reportsList.length > 0 ? reportsList.length.toLocaleString() : '0'}
                        </p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1 overflow-hidden">
                                <div className="bg-[var(--primary)] h-full rounded-full transition-all duration-700" style={{ width: `${analyzedPct}%` }} />
                            </div>
                            <span className="text-[10px] font-semibold text-gray-400 shrink-0">{analyzedPct}% Analyzed</span>
                        </div>
                    </div>

                    {/* Shared Count */}
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                        <div className="flex items-start justify-between mb-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shared Count</span>
                            <svg width="16" height="16" fill="none" stroke="#D1D5DB" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                        </div>
                        <p className="text-[32px] font-black text-gray-900 leading-none mb-1">{accessList.length}</p>
                        <p className="text-[11px] text-gray-400 font-medium">External specialists with access</p>
                    </div>

                    {/* Provider Access */}
                    <AccessManagement />
                </div>
            </div>

            {/* ════════════════════════════════
                3. RECENT ACTIVITY
            ════════════════════════════════ */}
            <div>
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <h2 className="text-[18px] font-black text-gray-900 tracking-tight">Recent Activity</h2>
                        <p className="text-[12.5px] text-gray-400 font-medium mt-0.5">Your latest medical document interactions</p>
                    </div>
                    <Link href="/dashboard/patient/reports" className="text-[12.5px] font-bold text-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                        View All Activity
                    </Link>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {reportsList.slice(0, 3).map((r, i) => {
                        const bgColors = [
                            { bg: 'bg-[var(--accent)]', text: 'text-[var(--primary)]', badgeTheme: 'bg-[var(--accent)] text-[var(--primary)]' },
                            { bg: 'bg-blue-100', text: 'text-[var(--primary)]', badgeTheme: 'bg-blue-100 text-blue-700' },
                            { bg: 'bg-red-100', text: 'text-red-500', badgeTheme: 'bg-orange-100 text-orange-700' }
                        ];
                        const theme = bgColors[i % bgColors.length];
                        const dateStr = r.uploadDate ? new Date(r.uploadDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

                        return (
                            <Link href={`/dashboard/patient/reports/${r._id}`} key={r._id} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4 hover:border-gray-300 transition-colors cursor-pointer group">
                                <div className={`w-11 h-11 ${theme.bg} rounded-full flex items-center justify-center ${theme.text} shrink-0`}>
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[13.5px] font-black text-gray-900 truncate group-hover:text-[var(--primary)] transition-colors">
                                        {r.testType || r.reportName || 'Medical Report'}
                                    </p>
                                    <p className="text-[11.5px] text-gray-400 font-medium truncate mb-2">Uploaded {dateStr}</p>
                                    <span className={`inline-block ${theme.badgeTheme} text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded`}>
                                        {r.status === 'ready' ? 'Analyzed' : r.status === 'processing' ? 'Processing' : 'Uploaded'}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}

                    {reportsList.length === 0 && (
                        <div className="col-span-3 bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex items-center gap-4">
                            <p className="text-[13px] text-gray-500 font-medium">No recent activity detected. Upload a report to begin analysis.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
