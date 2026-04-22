'use client';

import React, { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/lib/AuthContext';
import api from '@/services/api';

/* ─────────────────────────────────────────────────────────────────────────── */
/* STATUS PILL                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: string }) {
    const s = status?.toUpperCase();
    let cls = 'bg-gray-100 text-gray-600 border-gray-200';
    if (s === 'NORMAL' || s === 'OPTIMAL')      cls = 'bg-[#E8F9F0] text-[#1A7A45] border-[#C6EED9]';
    if (s === 'HIGH (GOOD)')                    cls = 'bg-[#E8F9F0] text-[#1A7A45] border-[#C6EED9]';
    if (s === 'ATTENTION')                      cls = 'bg-[var(--accent)] text-[var(--primary)] border-[var(--border)]';
    if (s === 'LOW'  || s === 'HIGH')           cls = 'bg-[#FFE4E6] text-[#9F1239] border-[var(--border)]';
    return (
        <span className={`inline-block px-3 py-[5px] rounded-full text-[9.5px] font-black tracking-wider border ${cls}`}>
            {status}
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* DONUT SCORE RING                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
function ScoreRing({ score = 94 }: { score?: number }) {
    const r    = 52;
    const circ = 2 * Math.PI * r;
    const dash = circ * (score / 100);
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative w-[128px] h-[128px] flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={r} fill="none" stroke="var(--accent)" strokeWidth="9" />
                    <circle
                        cx="60" cy="60" r={r} fill="none"
                        stroke="var(--primary)" strokeWidth="9"
                        strokeLinecap="round"
                        strokeDasharray={`${dash} ${circ - dash}`}
                    />
                </svg>
                <div className="z-10 text-center">
                    <p className="text-[38px] font-black text-[#1A202C] leading-none">{score}</p>
                    <p className="text-[9px] font-black text-[#A0AEC0] tracking-[0.15em] uppercase mt-0.5">Score</p>
                </div>
            </div>
            <div className="bg-[var(--accent)] border border-[var(--border)] text-[var(--primary)] text-[10.5px] font-black text-center px-4 py-2 rounded-full leading-tight">
                Top 5%<br />of Age Group
            </div>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* HELPERS                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

/** Strip markdown ** and leading bullets, return clean sentences */
function cleanSummary(raw: string): string {
    return raw
        .replace(/\*\*/g, '')
        .replace(/^\s*[-•*]\s*/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/** Derive dynamic Key Observations from biomarker list */
function deriveObservations(biomarkers: any[]): Array<{
    type: 'warning' | 'good' | 'info';
    title: string;
    desc: string;
}> {
    if (!biomarkers || biomarkers.length === 0) return [];

    const results: Array<{ type: 'warning' | 'good' | 'info'; title: string; desc: string }> = [];

    // Map biomarker names to clinical observations
    const nameMap: Record<string, { system: string; warningTitle: string; goodTitle: string }> = {
        'creatinine':         { system: 'Kidney',      warningTitle: 'Kidney Filtration Warning',  goodTitle: 'Kidney Function Normal' },
        'hba1c':              { system: 'Glycemic',    warningTitle: 'Glycemic Control Alert',      goodTitle: 'Glycemic Resilience' },
        'blood sugar':        { system: 'Glycemic',    warningTitle: 'Blood Sugar Elevated',        goodTitle: 'Blood Sugar Stable' },
        'glucose':            { system: 'Glycemic',    warningTitle: 'Glucose Imbalance',           goodTitle: 'Glucose Optimal' },
        'vitamin d':          { system: 'Nutritional', warningTitle: 'Vitamin D Deficiency',        goodTitle: 'Vitamin D Adequate' },
        'cholesterol':        { system: 'Lipid',       warningTitle: 'Cholesterol Elevated',        goodTitle: 'Lipid Profile Healthy' },
        'hdl':                { system: 'Lipid',       warningTitle: 'Low HDL Detected',            goodTitle: 'HDL Levels Optimal' },
        'ldl':                { system: 'Lipid',       warningTitle: 'LDL Elevated',                goodTitle: 'LDL Within Range' },
        'hemoglobin':         { system: 'Hematology',  warningTitle: 'Low Hemoglobin',              goodTitle: 'Hemoglobin Normal' },
        'wbc':                { system: 'Immune',      warningTitle: 'White Cell Count Alert',      goodTitle: 'Immune Markers Normal' },
        'crp':                { system: 'Inflammation',warningTitle: 'Inflammatory Marker Raised',  goodTitle: 'Inflammation Controlled' },
        'tsh':                { system: 'Thyroid',     warningTitle: 'Thyroid Imbalance Detected',  goodTitle: 'Thyroid Function Normal' },
        'triglycerides':      { system: 'Lipid',       warningTitle: 'Triglycerides Elevated',      goodTitle: 'Triglycerides Normal' },
    };

    const descMap: Record<string, { high: string; low: string; normal: string }> = {
        'creatinine':    {
            high:   'Creatinine levels are at the upper threshold. Recommend increased hydration and a follow-up eGFR test in 4 weeks.',
            low:    'Creatinine levels are unusually low. Review renal and muscular health.',
            normal: 'Kidney filtration markers are within healthy limits.',
        },
        'hba1c':         {
            high:   'Long-term glucose control is impaired. Review carbohydrate intake and consult your endocrinologist.',
            low:    'HbA1c is below baseline — possible hypoglycaemia risk.',
            normal: 'HbA1c confirms stable long-term glucose management. Your current dietary regimen is highly effective.',
        },
        'vitamin d':     {
            high:   'Vitamin D is elevated. Excess supplementation should be reviewed.',
            low:    'Vitamin D is below optimal range. Supplement 2000 IU D3 daily and increase sunlight exposure.',
            normal: 'Vitamin D levels are within the healthy range.',
        },
        'cholesterol':   {
            high:   'Total cholesterol is elevated. Reducing saturated fats and increasing exercise is advised.',
            low:    'Cholesterol is unusually low. Consult your physician.',
            normal: 'Cholesterol levels are within acceptable limits.',
        },
        'hdl':           {
            high:   'HDL (good cholesterol) is elevated — this is beneficial for cardiovascular health.',
            low:    'Low HDL increases cardiovascular risk. Regular aerobic exercise and healthy fats are recommended.',
            normal: 'HDL levels are within a healthy range.',
        },
        'triglycerides': {
            high:   'Elevated triglycerides signal increased metabolic risk. Reduce refined carbohydrates and sugar intake.',
            low:    'Triglycerides are very low — this is generally favourable.',
            normal: 'Triglyceride levels are within the normal range.',
        },
        'tsh':           {
            high:   'TSH is elevated, suggesting possible hypothyroidism. Follow up with your endocrinologist.',
            low:    'TSH is suppressed, suggesting possible hyperthyroidism. Clinical review is advised.',
            normal: 'Thyroid-stimulating hormone is within the normal range.',
        },
    };

    biomarkers.forEach(b => {
        const rawName   = (b.biomarkerName || '').toLowerCase();
        const matchKey  = Object.keys(nameMap).find(k => rawName.includes(k));
        if (!matchKey) return;

        const map   = nameMap[matchKey];
        const dmap  = descMap[matchKey];
        const val   = Number(b.value);
        const isLow = val < Number(b.referenceMin);
        const isHigh= val > Number(b.referenceMax);

        if (b.isAbnormal) {
            results.push({
                type:  'warning',
                title: isLow ? map.warningTitle : map.warningTitle,
                desc:  dmap ? (isLow ? dmap.low : dmap.high) : `${b.biomarkerName} is outside the optimal range (${b.value} ${b.unit}).`,
            });
        } else {
            results.push({
                type:  'good',
                title: map.goodTitle,
                desc:  dmap?.normal ?? `${b.biomarkerName} is within the expected reference range.`,
            });
        }
    });

    // max 3 observations to keep panel clean; prioritise warnings first
    const warnings = results.filter(r => r.type === 'warning');
    const goods    = results.filter(r => r.type === 'good');
    return [...warnings, ...goods].slice(0, 3);
}

/** Compute biomarker table rows from live or fallback data */
const STATIC_ROWS = [
    { name: 'Blood Sugar (Fasting)', value: '92',  unit: 'mg/dL', range: '70 - 99',   status: 'NORMAL'      },
    { name: 'HbA1c',                 value: '5.4', unit: '%',     range: '< 5.7',     status: 'NORMAL'      },
    { name: 'Creatinine',            value: '1.2', unit: 'mg/dL', range: '0.7 - 1.3', status: 'ATTENTION'   },
    { name: 'Vitamin D (25-OH)',      value: '28',  unit: 'ng/mL', range: '30 - 100',  status: 'LOW'         },
    { name: 'hs-CRP',                value: '0.8', unit: 'mg/L',  range: '< 1.0',     status: 'OPTIMAL'     },
    { name: 'HDL Cholesterol',       value: '62',  unit: 'mg/dL', range: '> 40',      status: 'HIGH (GOOD)' },
];

/* ─────────────────────────────────────────────────────────────────────────── */
/* PAGE                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function PatientHealthInsightsPage() {
    const { user, loading: authLoading } = useAuth();

    const [reports,            setReports]            = useState<any[]>([]);
    const [activeId,           setActiveId]           = useState<string | null>(null);
    const [report,             setReport]             = useState<any>(null);
    const [doctors,            setDoctors]            = useState<any[]>([]);
    const [matchedSpecialties, setMatchedSpecialties] = useState<string[]>([]);
    const [connectingId,       setConnectingId]       = useState<string | null>(null);
    const [connectMsg,         setConnectMsg]         = useState<Record<string, string>>({});
    const [pageLoading,        setPageLoading]        = useState(true);

    /* ── fetch reports ────────────────────────────────────────────── */
    useEffect(() => {
        if (authLoading) return;
        if (!user) { setPageLoading(false); return; }
        const run = async () => {
            try {
                const data = await reportService.getPatientReports();
                const list = Array.isArray(data) ? data : [];
                setReports(list);
                if (list.length > 0) setActiveId(list[0]._id);
            } catch { /* silent */ }
            finally { setPageLoading(false); }
        };
        run();
    }, [user, authLoading]);

    /* ── fetch detail when active report changes ──────────────────── */
    useEffect(() => {
        if (!activeId) return;
        const run = async () => {
            try {
                const d = await reportService.getReportById(activeId);
                setReport(d);
            } catch { /* silent */ }
        };
        run();
    }, [activeId]);

    /* ── fetch doctors (smart recommended by biomarker issues) ─────── */
    useEffect(() => {
        if (!user) return;
        const run = async () => {
            try {
                const res = await api.get('/patients/recommended-doctors');
                const data = res.data as any;
                setDoctors(Array.isArray(data.doctors) ? data.doctors : []);
                setMatchedSpecialties(Array.isArray(data.matchedSpecialties) ? data.matchedSpecialties : []);
            } catch {
                // Fallback to empty
                setDoctors([]);
            }
        };
        run();
    }, [user]);

    /* ── derived ──────────────────────────────────────────────────── */
    const rawBiomarkers: any[] = report?.biomarkers || [];

    const tableRows = rawBiomarkers.length > 0
        ? rawBiomarkers.map((b: any) => {
            const val   = Number(b.value);
            const isLow = val < Number(b.referenceMin);
            const status = b.isAbnormal ? (isLow ? 'LOW' : 'ATTENTION') : 'NORMAL';
            return {
                name:  b.biomarkerName,
                value: String(b.value),
                unit:  b.unit || '',
                range: `${b.referenceMin} - ${b.referenceMax}`,
                status,
            };
        })
        : STATIC_ROWS;

    const observations = deriveObservations(rawBiomarkers);

    // Clean AI summary — strip markdown, keep natural sentences
    const rawSummary = report?.aiSummary || '';
    const cleanedSummary = rawSummary
        ? cleanSummary(rawSummary)
        : `${user?.name?.split(' ')[0] || 'Alex'}, your metabolic profile shows significant improvement. AI analysis suggests that your adjusted sleep routine is directly correlating with reduced inflammatory markers and better glucose regulation.`;

    // Highlight "reduced inflammatory markers" phrase
    const renderSummary = (text: string) => {
        const phrase = 'reduced inflammatory markers';
        const idx    = text.toLowerCase().indexOf(phrase);
        if (idx === -1) return <p className="text-[14px] leading-[1.8] text-[#4A5568]">{text}</p>;
        return (
            <p className="text-[14px] leading-[1.8] text-[#4A5568]">
                {text.slice(0, idx)}
                <span className="text-[#E53E3E] font-semibold underline decoration-[var(--border)] decoration-2 underline-offset-2">
                    {text.slice(idx, idx + phrase.length)}
                </span>
                {text.slice(idx + phrase.length)}
            </p>
        );
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const pdfUrl = report?.fileUrl ? `${apiUrl}${report.fileUrl}` : '#';

    /* ── loading state ────────────────────────────────────────────── */
    if (pageLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="w-10 h-10 border-[var(--primary)] border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    /* ── no reports ───────────────────────────────────────────────── */
    if (reports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
                <div className="w-16 h-16 bg-[var(--accent)] rounded-full flex items-center justify-center">
                    <svg width="28" height="28" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <div>
                    <p className="text-[18px] font-black text-[#1A202C]">No Health Insights Yet</p>
                    <p className="text-[13px] text-[#718096] font-medium mt-1 max-w-xs">Once your lab reports are processed, your health insights will appear here.</p>
                </div>
            </div>
        );
    }

    /* ═══════════════════════════════════════════════════════════════ */
    return (
        <div className="-mx-8 -my-6 flex h-[calc(100vh-80px)] bg-[var(--background)]">

            {/* ════ LEFT CONTENT ══════════════════════════════════════════ */}
            <div className="flex-1 overflow-y-auto px-8 py-7">
                <div className="max-w-[660px] space-y-5">

                    {/* Report selector pills (if multiple reports) */}
                    {reports.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {reports.map((r: any) => (
                                <button
                                    key={r._id}
                                    onClick={() => setActiveId(r._id)}
                                    className={`shrink-0 px-4 py-2 rounded-full text-[12px] font-bold border transition-all ${
                                        activeId === r._id
                                            ? 'bg-[#1A202C] text-white border-[#1A202C]'
                                            : 'bg-white text-[#718096] border-[var(--border)] hover:border-[#CBD5E0]'
                                    }`}
                                >
                                    {r.testType || r.reportName || 'Report'} &bull;{' '}
                                    {r.uploadDate ? new Date(r.uploadDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'Recent'}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── CARD 1: AI Health Synthesis ──────────────────────── */}
                    <div className="bg-white rounded-[26px] p-7 shadow-[0_2px_14px_rgba(0,0,0,0.05)] border border-[var(--border)]">

                        {/* top badge row */}
                        <div className="flex items-center gap-3 mb-5">
                            <span className="inline-flex items-center gap-1.5 bg-[#E8F9F0] border border-[#C6EED9] text-[#1A7A45] text-[9px] font-black tracking-[0.14em] uppercase px-3 py-1.5 rounded-full">
                                <span className="w-[5px] h-[5px] rounded-full bg-[#22C55E]" />
                                Metabolic Stable
                            </span>
                            <span className="text-[11px] text-[#A0AEC0] font-medium">Sync: 12 minutes ago</span>
                        </div>

                        {/* body: text + ring */}
                        <div className="flex items-start gap-7">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-[32px] font-black text-[#1A202C] tracking-tight leading-none mb-4">
                                    AI Health Synthesis
                                </h2>
                                <div className="mb-6">
                                    {renderSummary(cleanedSummary)}
                                </div>
                                <div className="flex items-center gap-4">
                                    <button className="bg-[var(--primary)] hover:bg-[var(--primary)] active:scale-95 text-[#1A202C] font-black text-[12.5px] px-6 py-3 rounded-full transition-all shadow-sm">
                                        View Full Report
                                    </button>
                                    <a
                                        href={pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-[#4A5568] hover:text-[#1A202C] font-bold text-[12.5px] transition-colors"
                                    >
                                        Download PDF
                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                            <polyline points="7 10 12 15 17 10"/>
                                            <line x1="12" y1="15" x2="12" y2="3"/>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                            <div className="shrink-0 pt-2">
                                <ScoreRing score={94} />
                            </div>
                        </div>
                    </div>

                    {/* ── CARD 2: Biomarker Table ───────────────────────────── */}
                    <div className="bg-white rounded-[26px] px-7 py-6 shadow-[0_2px_14px_rgba(0,0,0,0.05)] border border-[var(--border)]">

                        {/* card header */}
                        <div className="flex items-start justify-between mb-5">
                            <div className="flex items-start gap-3">
                                <div className="w-[3.5px] h-[40px] bg-[var(--primary)] rounded-full mt-0.5 shrink-0" />
                                <h3 className="text-[18px] font-black text-[#1A202C] leading-snug">
                                    Detailed Biomarker<br />Breakdown
                                </h3>
                            </div>
                            <p className="text-[10px] text-[#A0AEC0] font-medium text-right leading-snug w-40 flex-shrink-0 pt-1">
                                {report?.uploadDate
                                    ? `Last Panel: ${new Date(report.uploadDate).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                    : 'Last Comprehensive Panel: Oct 24, 2023'}
                            </p>
                        </div>

                        {/* table */}
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse min-w-[480px]">
                                <thead>
                                    <tr>
                                        {['BIOMARKER', 'VALUE', 'UNIT', 'OPTIMAL RANGE', 'STATUS'].map(h => (
                                            <th key={h} className="text-[8.5px] font-black text-[#A0AEC0] tracking-[0.14em] uppercase text-left pb-3 pr-3 first:pl-0">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableRows.map((row, i) => (
                                        <tr key={i} className="border-t border-[#F5EFE0]/80 group">
                                            <td className="py-[13px] pr-3 text-[13px] font-bold text-[#1A202C] w-[33%]">
                                                {row.name}
                                            </td>
                                            <td className="py-[13px] pr-3 text-[13px] font-bold text-[#1A202C]">
                                                {row.value}
                                            </td>
                                            <td className="py-[13px] pr-3 text-[12px] text-[#A0AEC0]">
                                                {row.unit}
                                            </td>
                                            <td className="py-[13px] pr-4 text-[12px] text-[#A0AEC0]">
                                                {row.range}
                                            </td>
                                            <td className="py-[13px]">
                                                <StatusPill status={row.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* ════ RIGHT PANEL ════════════════════════════════════════════ */}
            <div className="w-[310px] shrink-0 bg-[var(--accent-soft)] border-l border-[var(--border)] overflow-y-auto py-6 px-5 flex flex-col gap-5">

                {/* ── KEY OBSERVATIONS (dynamic) ──────────────────────────── */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <svg width="17" height="17" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <rect x="8" y="2" width="8" height="4" rx="1"/>
                            <path d="M12 11h4"/><path d="M12 16h4"/>
                            <path d="M8 11h.01"/><path d="M8 16h.01"/>
                        </svg>
                        <h3 className="text-[14.5px] font-black text-[#1A202C]">Key Observations</h3>
                    </div>

                    {observations.length > 0 ? (
                        <div className="space-y-3">
                            {observations.map((obs, i) => (
                                <div key={i} className="bg-white rounded-[16px] p-4 border border-[var(--border)] shadow-[0_1px_5px_rgba(0,0,0,0.04)]">
                                    <div className="flex items-start gap-3">
                                        {/* icon */}
                                        {obs.type === 'warning' ? (
                                            <span className="w-[26px] h-[26px] rounded-full bg-[var(--accent)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                                                <svg width="12" height="12" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                                </svg>
                                            </span>
                                        ) : (
                                            <span className="w-[26px] h-[26px] rounded-full bg-[#E8F9F0] border border-[#C6EED9] flex items-center justify-center shrink-0 mt-0.5">
                                                <svg width="12" height="12" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                            </span>
                                        )}
                                        <div>
                                            <h4 className="text-[12px] font-black text-[#1A202C] mb-1 leading-snug">{obs.title}</h4>
                                            <p className="text-[10.5px] text-[#718096] font-medium leading-[1.65]">{obs.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Fallback static observations when no biomarker data yet */
                        <div className="space-y-3">
                            <div className="bg-white rounded-[16px] p-4 border border-[var(--border)] shadow-[0_1px_5px_rgba(0,0,0,0.04)]">
                                <div className="flex items-start gap-3">
                                    <span className="w-[26px] h-[26px] rounded-full bg-[var(--accent)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg width="12" height="12" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    </span>
                                    <div>
                                        <h4 className="text-[12px] font-black text-[#1A202C] mb-1 leading-snug">Kidney Filtration Warning</h4>
                                        <p className="text-[10.5px] text-[#718096] font-medium leading-[1.65]">Creatinine levels are at the upper threshold (1.2). Recommend increased hydration and a follow-up eGFR test in 4 weeks.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-[16px] p-4 border border-[var(--border)] shadow-[0_1px_5px_rgba(0,0,0,0.04)]">
                                <div className="flex items-start gap-3">
                                    <span className="w-[26px] h-[26px] rounded-full bg-[#E8F9F0] border border-[#C6EED9] flex items-center justify-center shrink-0 mt-0.5">
                                        <svg width="12" height="12" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                    <div>
                                        <h4 className="text-[12px] font-black text-[#1A202C] mb-1 leading-snug">Glycemic Resilience</h4>
                                        <p className="text-[10.5px] text-[#718096] font-medium leading-[1.65]">HbA1c of 5.4% confirms stable long-term glucose management. Your current dietary regimen is highly effective.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Smart bullet tips based on flagged markers */}
                    {rawBiomarkers.length > 0 && (
                        <div className="mt-4 px-1 space-y-2">
                            {rawBiomarkers
                                .filter((b: any) => b.isAbnormal)
                                .slice(0, 3)
                                .map((b: any, i: number) => {
                                    const isLow = Number(b.value) < Number(b.referenceMin);
                                    const tips: Record<string, string> = {
                                        'vitamin d': 'Supplement 2000IU Vitamin D3 daily',
                                        'creatinine': 'Increase daily water intake to 3L',
                                        'cholesterol': 'Reduce saturated fat; add oat bran',
                                        'hdl': 'Continue HIIT cardio twice weekly',
                                        'triglycerides': 'Limit refined carbohydrates & sugar',
                                        'hba1c': 'Monitor post-meal glucose spikes',
                                        'glucose': 'Monitor sodium intake for 14 days',
                                    };
                                    const bn   = (b.biomarkerName || '').toLowerCase();
                                    const tipKey = Object.keys(tips).find(k => bn.includes(k));
                                    const tip    = tipKey ? tips[tipKey] : `Review ${b.biomarkerName} with your clinician`;
                                    return (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-[var(--primary)] text-[11px] mt-0.5 shrink-0">★</span>
                                            <p className="text-[10.5px] text-[#4A5568] font-medium leading-snug">{tip}</p>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* ── CLINICAL NETWORK (smart doctor matching) ─────────────── */}
                <div className="bg-white rounded-[20px] p-5 border border-[var(--border)] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-[14px] font-black text-[#1A202C]">Clinical Network</h3>
                        {matchedSpecialties.length > 0 && (
                            <span className="text-[9px] font-black bg-[var(--accent)] text-[var(--primary)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                                {matchedSpecialties.length} specialist{matchedSpecialties.length > 1 ? 's' : ''} matched
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-[#A0AEC0] font-medium mb-4">
                        {matchedSpecialties.length > 0
                            ? 'Based on your biomarkers, these specialists are recommended for you:'
                            : 'Connect with specialists from our clinical network:'}
                    </p>

                    {doctors.length > 0 ? (
                        <div className="space-y-3">
                            {doctors.map((doc: any, i: number) => {
                                const name      = doc.name || 'Doctor';
                                const specialty = doc.specialty || 'General Medicine';
                                const initial   = name.charAt(0).toUpperCase();
                                const isMatch   = !!doc.matchReason;
                                const sent      = connectMsg[doc._id];
                                return (
                                    <div key={doc._id || i} className={`rounded-2xl p-3 border transition-colors ${isMatch ? 'border-[var(--border)] bg-[#FEFDF9]' : 'border-gray-100 bg-gray-50/60'}`}>
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] flex items-center justify-center text-[#1D4ED8] font-black text-[13px] shrink-0 border border-[#BFDBFE]">
                                                {initial}
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1 flex-wrap mb-0.5">
                                                    <span className="text-[12.5px] font-black text-[#1A202C] leading-tight">
                                                        {name.startsWith('Dr') ? name : `Dr. ${name}`}
                                                    </span>
                                                    {isMatch && (
                                                        <span className="text-[8px] font-black bg-[var(--accent)] text-[var(--primary)] px-1.5 py-0.5 rounded-full border border-[var(--border)] whitespace-nowrap">
                                                            ★ Matches your issues
                                                        </span>
                                                    )}
                                                    {(doc as any).isVerified && (
                                                        <span className="text-[8px] font-black bg-[#D1FAE5] text-[#065F46] px-1.5 py-0.5 rounded-full border border-[#A7F3D0] whitespace-nowrap">
                                                            ✓ Verified
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-[#A0AEC0] font-medium">{specialty}{doc.experience ? ` · ${doc.experience}` : ''}</p>
                                                {isMatch && <p className="text-[9px] text-[var(--primary)] font-bold mt-0.5">⚠ {doc.matchReason}</p>}
                                                {doc.hospital && <p className="text-[9px] text-[#CBD5E0] mt-0.5 truncate">{doc.hospital}</p>}
                                            </div>
                                        </div>
                                        {/* Connect / sent */}
                                        {sent ? (
                                            <div className="mt-2 text-[10px] text-[#065F46] font-bold bg-[#D1FAE5] rounded-xl px-3 py-1.5 text-center border border-[#A7F3D0]">
                                                ✓ {sent}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    setConnectingId(doc._id);
                                                    try {
                                                        const r = await api.post(`/patients/request-consultation/${doc._id}`, {
                                                            concern: doc.matchReason || undefined,
                                                        });
                                                        setConnectMsg(prev => ({ ...prev, [doc._id]: (r.data as any).message || 'Request sent!' }));
                                                    } catch {
                                                        setConnectMsg(prev => ({ ...prev, [doc._id]: 'Failed. Try again.' }));
                                                    } finally {
                                                        setConnectingId(null);
                                                    }
                                                }}
                                                disabled={connectingId === doc._id}
                                                className="mt-2.5 w-full bg-[#1A202C] hover:bg-[#2D3748] disabled:opacity-60 text-white font-bold text-[11px] py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                                            >
                                                {connectingId === doc._id ? (
                                                    <span className="w-3 h-3 border-[var(--primary)] border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 10.23 19.79 19.79 0 0 1 1.61 1.6 2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72c.128.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.06 6.06l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.572 2.81.7A2 2 0 0 1 22 16.92z"/>
                                                    </svg>
                                                )}
                                                Connect with Dr. {name.split(' ')[0]}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <svg className="mx-auto mb-2 text-gray-200" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <p className="text-[11px] text-[#A0AEC0] font-medium">No specialists available yet.</p>
                            <p className="text-[10px] text-[#C4C9CE] mt-0.5">Upload a report so we can match you with the right specialist.</p>
                        </div>
                    )}

                    <button
                        onClick={async () => {
                            try { await api.post('/patients/request-review', {}); } catch { /* silent */ }
                        }}
                        className="w-full mt-4 bg-[var(--primary)] hover:bg-[var(--primary)] active:scale-95 text-[#1A202C] font-black text-[12px] py-3 rounded-full flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        Schedule Review with My Doctors
                    </button>
                </div>

            </div>
        </div>
    );
}
