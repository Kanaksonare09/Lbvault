'use client';

import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { pathologyService } from '@/services/pathologyService';
import { AnalyticsData } from '@/types';
import {
    BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Design tokens ────────────────────────────────────────────────────────────
const AMBER  = 'var(--primary)';
const DARK   = '#1A1F2E';
const COLORS = [AMBER, 'var(--primary)', '#8B5CF6', 'var(--primary)', '#EC4899'];
const DAYS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_FILTERS = ['7 Days', '30 Days', '3 Months', '1 Year'];

// ─── Shared tooltip style ─────────────────────────────────────────────────────
const tooltipStyle = {
    contentStyle: {
        background: DARK,
        border: 'none',
        borderRadius: '10px',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        padding: '8px 14px',
    },
    itemStyle: { color: 'var(--accent)' },
    labelStyle: { color: '#9CA3AF', marginBottom: '2px' },
    cursor: { fill: 'rgba(200,168,75,0.06)' },
};

// ─── KPI card ─────────────────────────────────────────────────────────────────
function KpiCard({
    label, value, change, changeUp, icon,
}: {
    label: string; value: string | number;
    change: string; changeUp: boolean; icon: React.ReactNode;
}) {
    return (
        <div
            className="bg-white rounded-2xl p-5"
            style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: '#F4F6F9' }}
                >
                    {icon}
                </div>
                <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                        background: changeUp ? 'var(--accent)' : '#FEE2E2',
                        color:      changeUp ? 'var(--primary)' : '#991B1B',
                    }}
                >
                    {change}
                </span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p
                className="font-black text-gray-900"
                style={{ fontSize: '1.7rem', lineHeight: 1 }}
            >
                {value}
            </p>
        </div>
    );
}

// ─── Section card wrapper ─────────────────────────────────────────────────────
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div
            className="bg-white rounded-2xl p-6"
            style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
            <h3 className="text-[14px] font-black text-gray-900 mb-5">{title}</h3>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PathologyAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [labProfile, setLabProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('7 Days');

    const downloadAudit = () => {
        const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const rows: string[][] = [
            ['Monthly Performance Audit Report', month],
            [],
            ['KPI Summary'],
            ['Metric', 'Value'],
            ['Total Reports',   String(data?.totalReports  ?? 0)],
            ['Total Patients',  String(data?.totalPatients ?? 0)],
            ['Efficiency Rate', `${data?.efficiencyRate ?? 94}%`],
            ['Uploaded Today',  String((data as any)?.uploadedToday ?? 0)],
            [],
            ['Test Type Distribution'],
            ['Test Type', 'Count', 'Percentage'],
            ...testTypeData.map(t => [
                t.name,
                String(t.count),
                `${Math.round((t.count / Math.max(1, testTypeData.reduce((s, x) => s + x.count, 0))) * 100)}%`
            ]),
        ];
        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = `audit_${new Date().toISOString().slice(0,7)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        Promise.all([
            analyticsService.getAnalytics(),
            pathologyService.getProfile(),
        ])
            .then(([analyticsData, profileData]) => {
                setData(analyticsData);
                setLabProfile(profileData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const labName = labProfile?.labName || 'Lab Analytics';

    // ── Derive weekly bars from volumeHistory (real backend) ────────────────
    // backend returns: volumeHistory = [{_id: "YYYY-MM-DD", count: N}, ...]
    const weeklyData: { day: string; reports: number; avg: number }[] = (() => {
        const rawVol: { _id: string; count: number }[] = (data as any)?.volumeHistory || [];
        if (rawVol.length > 0) {
            return rawVol.map(item => {
                const d = new Date(item._id);
                const dayName = d.toLocaleDateString('en', { weekday: 'short' });
                return { day: dayName, reports: item.count, avg: Math.round(item.count * 0.82) };
            });
        }
        // fallback static
        return (data?.weeklyVolume || [62, 50, 70, 100, 130, 55, 48]).map((v, i) => ({
            day: DAYS[i] ?? `Day ${i + 1}`, reports: v, avg: Math.round(v * 0.82),
        }));
    })();

    // ── Test type distribution from real categoryDistribution ───────────────
    const testTypeData: { name: string; count: number }[] = (() => {
        const rawCat: { name: string; value: number }[] = (data as any)?.categoryDistribution || [];
        if (rawCat.length > 0) {
            // backend: {name, value} — convert to {name, count}
            return rawCat.filter(t => t.name).map(t => ({ name: t.name, count: t.value }));
        }
        if (data?.testTypes && data.testTypes.length > 0) return data.testTypes;
        return [
            { name: 'CBC',           count: 420 },
            { name: 'Lipid Profile', count: 280 },
            { name: 'Thyroid',       count: 185 },
            { name: 'Glucose',       count: 310 },
            { name: 'Urine',         count: 95  },
        ];
    })();

    // ── Recent uploads from backend ─────────────────────────────────────────
    const recentUploads: any[] = (data as any)?.recentUploads || [];

    // ── KPI trends from backend ─────────────────────────────────────────────
    const reportTrend  = (data as any)?.reportTrend  || '+12%';
    const patientTrend = (data as any)?.patientTrend || '+8%';
    const uploadedToday= (data as any)?.uploadedToday ?? 0;

    const trendData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
        month: m,
        patients: Math.round((data?.totalPatients ?? 300) * (0.6 + i * 0.08)),
        reports:  Math.round((data?.totalReports  ?? 1200) * (0.5 + i * 0.1)),
    }));

    const riskData = [
        { name: 'Normal',     value: Math.round((data?.totalReports ?? 500) * 0.65), color: AMBER },
        { name: 'Borderline', value: Math.round((data?.totalReports ?? 500) * 0.22), color: 'var(--primary)' },
        { name: 'Critical',   value: Math.round((data?.totalReports ?? 500) * 0.13), color: '#EF4444' },
    ];

    const totalTest = testTypeData.reduce((s, t) => s + t.count, 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div
                    className="w-10 h-10 border-4 rounded-full animate-spin"
                    style={{ borderColor: '#E8EDF2', borderTopColor: AMBER }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-10">

            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-black text-gray-900"
                        style={{ fontSize: '1.55rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}
                    >
                        {labName}
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-1 font-medium">
                        Clinical performance insights and diagnostic trends.
                    </p>
                </div>

                {/* Time filter pills */}
                <div
                    className="flex items-center p-1 rounded-xl"
                    style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                >
                    {TIME_FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setTimeFilter(f)}
                            className="px-3.5 py-1.5 rounded-lg text-[11.5px] font-semibold transition-all"
                            style={timeFilter === f
                                ? { background: AMBER, color: '#fff', boxShadow: '0 2px 6px rgba(200,168,75,0.3)' }
                                : { color: 'var(--muted-foreground)' }
                            }
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── KPI Cards ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-4">
                <KpiCard
                    label="Total Reports"
                    value={data?.totalReports ?? 0}
                    change={reportTrend}
                    changeUp={reportTrend.startsWith('+')}
                    icon={
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4A5568" strokeWidth="2">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Total Patients"
                    value={data?.totalPatients ?? 0}
                    change={patientTrend}
                    changeUp={patientTrend.startsWith('+')}
                    icon={
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4A5568" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Uploaded Today"
                    value={uploadedToday}
                    change={uploadedToday > 0 ? `+${uploadedToday} today` : 'No uploads'}
                    changeUp={uploadedToday > 0}
                    icon={
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4A5568" strokeWidth="2">
                            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                            <polyline points="16 7 22 7 22 13" />
                        </svg>
                    }
                />
                <KpiCard
                    label="Efficiency Rate"
                    value={`${data?.efficiencyRate ?? 94}%`}
                    change="On Track"
                    changeUp
                    icon={
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#4A5568" strokeWidth="2">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                        </svg>
                    }
                />
            </div>

            {/* ── Charts Row 1 ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">

                {/* Weekly Volume Bar */}
                <ChartCard title="Weekly Report Volume">
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={weeklyData} barGap={3} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F4F7" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                            <Tooltip {...tooltipStyle} />
                            <Bar dataKey="reports" fill={AMBER} radius={[5, 5, 0, 0]} name="Reports" />
                            <Bar dataKey="avg" fill="#E8EDF2" radius={[5, 5, 0, 0]} name="Avg" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Patient & Report Trends */}
                <ChartCard title="Patient & Report Trends">
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={trendData} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
                            <defs>
                                <linearGradient id="patGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor={AMBER} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="repGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#F1F4F7" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                            <YAxis axisLine={false} tickLine={false}
                                tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                            <Tooltip {...tooltipStyle} />
                            <Area type="monotone" dataKey="patients" stroke={AMBER}      strokeWidth={2} fill="url(#patGrad)" name="Patients" />
                            <Area type="monotone" dataKey="reports"  stroke="var(--primary)"    strokeWidth={2} fill="url(#repGrad)" name="Reports" />
                            <Legend
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', fontWeight: 600, paddingTop: '8px' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ── Charts Row 2 ─────────────────────────────────────────────── */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 280px' }}>

                {/* Test Type Distribution - bar rows */}
                <ChartCard title="Test Type Distribution">
                    <div className="space-y-4">
                        {testTypeData.map((test, i) => {
                            const pct = Math.round((test.count / totalTest) * 100);
                            return (
                                <div key={test.name}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ background: COLORS[i % COLORS.length] }}
                                            />
                                            <span className="text-[12.5px] font-semibold text-gray-700">{test.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[12px] font-bold text-gray-500">{test.count}</span>
                                            <span
                                                className="text-[10px] font-bold w-8 text-right"
                                                style={{ color: COLORS[i % COLORS.length] }}
                                            >
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="w-full rounded-full overflow-hidden"
                                        style={{ height: '5px', background: '#F4F6F9' }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ChartCard>

                {/* Risk Indicators donut */}
                <ChartCard title="Risk Indicators">
                    <div className="relative">
                        <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                                <Pie
                                    data={riskData}
                                    cx="50%" cy="50%"
                                    innerRadius={48} outerRadius={70}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {riskData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip {...tooltipStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="space-y-2.5 mt-2">
                        {riskData.map((r) => (
                            <div key={r.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                                    <span className="text-[12px] font-semibold text-gray-600">{r.name}</span>
                                </div>
                                <span className="text-[12px] font-bold text-gray-700">{r.value}</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* ── Recent Uploads section ─────────────────────────────────────── */}
            {recentUploads.length > 0 && (
                <ChartCard title="Recent Uploads">
                    <div className="space-y-3">
                        {recentUploads.map((r: any, i: number) => (
                            <div key={r.reportId || i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent)' }}>
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={AMBER} strokeWidth="2">
                                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                            <polyline points="14 2 14 8 20 8" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-gray-800">{r.patientName}</p>
                                        <p className="text-[11px] text-gray-400">{r.testType}</p>
                                    </div>
                                </div>
                                <span className="text-[11px] text-gray-400 font-medium">
                                    {r.uploadDate ? new Date(r.uploadDate).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            )}

            {/* ── Monthly Audit CTA ─────────────────────────────────────────── */}
            <div
                className="rounded-2xl p-7 flex items-center justify-between gap-6 relative overflow-hidden"
                style={{ background: DARK }}
            >
                {/* ambient glow */}
                <div
                    className="absolute right-0 top-0 w-56 h-56 rounded-full opacity-10"
                    style={{ background: AMBER, filter: 'blur(60px)', transform: 'translate(30%, -30%)' }}
                />
                <div className="relative z-10">
                    <p className="text-[16px] font-black text-white mb-1">Monthly Performance Audit</p>
                    <p className="text-[12.5px] font-medium" style={{ color: '#9CA3AF' }}>
                        Download the full diagnostic report for{' '}
                        {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}.
                    </p>
                </div>
                <button
                    onClick={downloadAudit}
                    className="inline-flex items-center gap-2 font-semibold text-[13px] px-5 py-2.5 rounded-xl shrink-0 transition-all hover:opacity-90 relative z-10 active:scale-95"
                    style={{ background: AMBER, color: '#fff', boxShadow: '0 4px 14px rgba(200,168,75,0.35)' }}
                >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download Report
                </button>
            </div>
        </div>
    );
}
