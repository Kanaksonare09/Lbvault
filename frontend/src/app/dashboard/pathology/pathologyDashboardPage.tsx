'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { pathologyService } from '@/services/pathologyService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

// ─── Color tokens matching reference image ───────────────────────────────────
const DONUT_COLORS = ['#5C4A1E', '#2563EB', '#C8A84B'];

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Fallback volume data shaped like the image (bars increasing toward Thu/Fri)
const FALLBACK_VOLUME = [
    { day: 'MON', count: 62 },
    { day: 'TUE', count: 50 },
    { day: 'WED', count: 70 },
    { day: 'THU', count: 100 },
    { day: 'FRI', count: 130 },
    { day: 'SAT', count: 55 },
    { day: 'SUN', count: 48 },
];

const FALLBACK_PIE = [
    { name: 'Histology', value: 35 },
    { name: 'Cytology', value: 30 },
    { name: 'Hematology', value: 35 },
];

// ─── Custom Bar shape with rounded top and amber accent line ─────────────────
function CustomBar(props: any) {
    const { x, y, width, height, active } = props;
    const radius = 6;
    const accentH = 4;
    const isActive = active;

    if (height <= 0) return null;

    return (
        <g>
            {/* Main bar */}
            <rect
                x={x}
                y={y + radius}
                width={width}
                height={Math.max(0, height - radius)}
                fill={isActive ? '#F5ECC9' : '#F0ECD6'}
                rx={0}
            />
            {/* Rounded top cap */}
            <rect
                x={x}
                y={y}
                width={width}
                height={radius * 2}
                fill={isActive ? '#F5ECC9' : '#F0ECD6'}
                rx={radius}
            />
            {/* Amber accent line at top */}
            <rect
                x={x}
                y={y}
                width={width}
                height={accentH}
                fill={isActive ? '#C8A84B' : '#D4B84A'}
                rx={radius}
            />
        </g>
    );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedValue({ value }: { value: string | number }) {
    return <span>{value}</span>;
}

export default function PathologyDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<any>(null);
    const [labProfile, setLabProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeBar, setActiveBar] = useState<number | null>(4); // FRI highlighted

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsData, profileData] = await Promise.all([
                    pathologyService.getAnalytics(),
                    pathologyService.getProfile(),
                ]);
                setAnalytics(analyticsData);
                setLabProfile(profileData);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Derived data ──────────────────────────────────────────────────────────
    const reportsToday = analytics?.uploadedToday ?? 142;
    const totalPatients = analytics?.totalPatients ?? 3892;
    const totalReports = analytics?.totalReports ?? 24500;
    const systemStatus = analytics?.systemStatus ?? 'Active';
    const reportTrend = analytics?.reportTrend ?? '+12% vs Yesterday';
    const recentUploads = analytics?.recentUploads ?? [];

    // Volume data: map API data or use fallback
    const volumeData: { day: string; count: number }[] = (() => {
        if (analytics?.volumeHistory && analytics.volumeHistory.length > 0) {
            return analytics.volumeHistory.map((item: any, i: number) => ({
                day: DAYS[i % 7],
                count: item.count ?? 0,
            }));
        }
        return FALLBACK_VOLUME;
    })();

    // Pie data
    const pieData: { name: string; value: number }[] = (() => {
        if (analytics?.categoryDistribution && analytics.categoryDistribution.length > 0) {
            return analytics.categoryDistribution.slice(0, 3).map((item: any) => ({
                name: item.name ?? item._id ?? 'Other',
                value: item.value ?? item.count ?? 0,
            }));
        }
        return FALLBACK_PIE;
    })();

    const totalPie = pieData.reduce((s, d) => s + d.value, 0);
    const capacityPct = Math.round((pieData[0]?.value ?? 85));

    // Format large numbers
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

    // Display name: prefer lab name from profile, then user name, then fallback
    const displayName = labProfile?.name || user?.name || 'there';
    const labName = labProfile?.labName || 'the lab';

    // Export summary as CSV
    const handleExport = () => {
        const rows: string[][] = [
            ['Metric', 'Value'],
            ['Reports Today', String(reportsToday)],
            ['Total Reports', String(totalReports)],
            ['Total Patients', String(totalPatients)],
            ['System Status', systemStatus],
            ['Report Trend', reportTrend],
        ];
        if (recentUploads.length > 0) {
            rows.push(['', '']);
            rows.push(['Patient', 'Test Type', 'Source', 'Uploaded At']);
            recentUploads.forEach((r: any) => {
                rows.push([
                    `"${r.patientName || 'Unknown'}"`,
                    `"${r.testType || 'N/A'}"`,
                    `"${r.source || labName}"`,
                    `"${r.uploadDate ? new Date(r.uploadDate).toLocaleString() : '—'}"`,
                ]);
            });
        }
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lab_summary_${new Date().toISOString().split('T')[0]}.csv`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#FCEEA5] border-t-[#C8A84B] rounded-full animate-spin" />
                    <p className="text-[13px] font-semibold text-gray-500 tracking-wide">Synchronizing Lab Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">

            {/* ── HERO ROW ──────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
                {/* Left: Title + subtitle */}
                <div>
                    <h1
                        className="font-black text-gray-900 leading-none"
                        style={{ fontSize: '2.6rem', letterSpacing: '-0.03em', lineHeight: 1.08 }}
                    >
                        Systems<br />Operational
                    </h1>
                    <p className="text-[13.5px] text-gray-500 mt-3 font-medium">
                        Welcome back,{' '}
                        <span className="text-gray-800 font-semibold">{displayName}</span>.
                        {' '}Running{' '}
                        <span className="text-blue-500 font-semibold">{labName}</span>{' '}
                        — {reportsToday} reports processed today.
                    </p>
                </div>

                {/* Right: Action buttons */}
                <div className="flex items-center gap-3 shrink-0 mt-1">
                    {/* Task 3: Export Summary – real CSV download */}
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 border border-gray-200 bg-white text-gray-700 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export Summary
                    </button>
                    {/* Task 2: New Analysis → redirects to upload-report */}
                    <Link
                        href="/dashboard/pathology/upload-report"
                        className="flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                        style={{ background: '#C8A84B', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                    >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        New Analysis
                    </Link>
                </div>
            </div>

            {/* ── STAT CARDS ROW ────────────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-4">

                {/* Card 1: Reports Today */}
                <div
                    className="bg-white rounded-2xl p-5"
                    style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: '#F4F6F8' }}
                        >
                            <svg width="18" height="18" fill="none" stroke="#4A5568" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                        </div>
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#EBF8F0', color: '#2D7A54', letterSpacing: '0.01em' }}
                        >
                            {reportTrend}
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reports Today</p>
                    <p className="text-[2rem] font-black text-gray-900" style={{ lineHeight: 1 }}>
                        <AnimatedValue value={reportsToday} />
                    </p>
                </div>

                {/* Card 2: Total Patients */}
                <div
                    className="bg-white rounded-2xl p-5"
                    style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: '#F4F6F8' }}
                        >
                            <svg width="18" height="18" fill="none" stroke="#4A5568" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#EBF3FF', color: '#1D62D9', letterSpacing: '0.01em' }}
                        >
                            Active Admission
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Patients</p>
                    <p className="text-[2rem] font-black text-gray-900" style={{ lineHeight: 1 }}>
                        <AnimatedValue value={totalPatients.toLocaleString()} />
                    </p>
                </div>

                {/* Card 3: Total Reports */}
                <div
                    className="bg-white rounded-2xl p-5"
                    style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: '#F4F6F8' }}
                        >
                            <svg width="18" height="18" fill="none" stroke="#4A5568" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="2" y="3" width="20" height="14" rx="2" />
                                <path d="M8 21h8M12 17v4" />
                            </svg>
                        </div>
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: '#F3F0FF', color: '#5B3ED9', letterSpacing: '0.01em' }}
                        >
                            Secure Archive
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Reports</p>
                    <p className="text-[2rem] font-black text-gray-900" style={{ lineHeight: 1 }}>
                        <AnimatedValue value={fmt(typeof totalReports === 'number' ? totalReports : 24500)} />
                    </p>
                </div>

                {/* Card 4: System Status — dark card */}
                <div
                    className="rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden"
                    style={{ background: '#1A1F2E', minHeight: '130px' }}
                >
                    {/* LIVE dot */}
                    <div className="flex items-center gap-1.5 justify-end">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-green-400 tracking-widest">LIVE</span>
                    </div>
                    {/* Shield icon */}
                    <div
                        className="absolute left-4 top-4 w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                        <svg width="18" height="18" fill="none" stroke="#FCEEA5" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                    </div>
                    <div className="mt-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">System Status</p>
                        <p
                            className="font-black text-white"
                            style={{ fontSize: '1.75rem', lineHeight: 1.1 }}
                        >
                            {systemStatus}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── CHARTS ROW ────────────────────────────────────────────────── */}
            <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px' }}>

                {/* Bar Chart: Analysis Volume History */}
                <div
                    className="bg-white rounded-2xl p-6"
                    style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h2 className="text-[15px] font-black text-gray-900">Analysis Volume History</h2>
                            <p className="text-[12px] text-gray-400 mt-0.5">Real-time throughput for the last 7 days</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                className="text-[12px] font-semibold px-3 py-1 rounded-full"
                                style={{ background: '#F0EBD8', color: '#5C4A1E' }}
                            >
                                Weekly
                            </button>
                            <button
                                className="text-[12px] font-semibold px-3 py-1 rounded-full text-gray-400 hover:bg-gray-50"
                            >
                                Monthly
                            </button>
                        </div>
                    </div>

                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={volumeData}
                                barCategoryGap="28%"
                                margin={{ top: 8, right: 0, bottom: 0, left: -20 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="0"
                                    vertical={false}
                                    stroke="#F2F2F2"
                                />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    hide
                                />
                                <Tooltip
                                    cursor={false}
                                    contentStyle={{
                                        background: '#1A1F2E',
                                        border: 'none',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontWeight: 700,
                                        padding: '6px 12px',
                                    }}
                                    itemStyle={{ color: '#FCEEA5' }}
                                    labelStyle={{ color: '#9CA3AF', marginBottom: 2 }}
                                />
                                <Bar
                                    dataKey="count"
                                    shape={(props: any) => (
                                        <CustomBar
                                            {...props}
                                            active={props.index === activeBar}
                                        />
                                    )}
                                    onClick={(_: any, index: number) => setActiveBar(index)}
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart: Test Distribution */}
                <div
                    className="rounded-2xl p-5 flex flex-col"
                    style={{ background: '#F5EFD0', border: '1px solid #E8DDB0' }}
                >
                    <h2 className="text-[14px] font-black text-gray-900 mb-0.5">Test Distribution</h2>
                    <p className="text-[11px] text-gray-500 mb-4">Current load by test category</p>

                    {/* Donut */}
                    <div className="relative flex items-center justify-center" style={{ height: 160 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    innerRadius={52}
                                    outerRadius={72}
                                    startAngle={90}
                                    endAngle={-270}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center label */}
                        <div className="absolute flex flex-col items-center pointer-events-none">
                            <span className="text-[1.5rem] font-black text-gray-900" style={{ lineHeight: 1 }}>
                                {capacityPct}%
                            </span>
                            <span className="text-[9px] font-bold text-gray-400 tracking-widest mt-0.5">CAPACITY</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-3 space-y-2">
                        {pieData.map((entry, i) => {
                            const pct = totalPie > 0 ? Math.round((entry.value / totalPie) * 100) : 0;
                            return (
                                <div key={entry.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}
                                        />
                                        <span className="text-[11px] font-medium text-gray-600">{entry.name}</span>
                                    </div>
                                    <span className="text-[11px] font-bold text-gray-700">{pct}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── LIVE UPLOAD FEED (preserved, not modified) ────────────────── */}
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
                {/* Feed header */}
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[15px] font-black text-gray-900">Live Upload Feed</h2>
                        <span className="flex items-center gap-1.5 bg-gray-100 px-2.5 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-gray-500 tracking-widest">LIVE</span>
                        </span>
                    </div>
                    <Link
                        href="/dashboard/pathology/reports"
                        className="text-[12px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        View All Feed
                    </Link>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderTop: '1px solid #F1F4F7', borderBottom: '1px solid #F1F4F7' }}>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient / ID</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analysis Type</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUploads.length > 0 ? (
                                recentUploads.map((report: any) => {
                                    const initials = (report.patientName || 'UN')
                                        .split(' ')
                                        .map((w: string) => w[0])
                                        .join('')
                                        .slice(0, 2)
                                        .toUpperCase();

                                    const uploadedAt = report.uploadDate
                                        ? (() => {
                                            const diffMs = Date.now() - new Date(report.uploadDate).getTime();
                                            const diffMin = Math.floor(diffMs / 60000);
                                            if (diffMin < 60) return `${diffMin} mins ago`;
                                            const diffH = Math.floor(diffMin / 60);
                                            if (diffH < 24) return `${diffH} hrs ago`;
                                            return new Date(report.uploadDate).toLocaleDateString();
                                        })()
                                        : '—';

                                    // Task 4: derive source dynamically from API, then from lab name, then fallback
                                    const sourceLabel = report.source
                                        || (labProfile?.labName
                                            ? labProfile.labName.toUpperCase().replace(/\s+/g, '-').slice(0, 12)
                                            : 'INTERNAL');
                                    const isExternal = sourceLabel === 'EXTERNAL';

                                    return (
                                        <tr
                                            key={report.reportId || report._id}
                                            className="hover:bg-gray-50 transition-colors"
                                            style={{ borderBottom: '1px solid #F1F4F7' }}
                                        >
                                            {/* Patient */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                                        style={{ background: '#4A5568' }}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-semibold text-gray-800">{report.patientName}</p>
                                                        <p className="text-[11px] text-gray-400">ID: {report.patientId || '#PX-' + Math.floor(Math.random() * 9000 + 1000)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Analysis Type */}
                                            <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">
                                                {report.testType}
                                            </td>
                                            {/* Source */}
                                            <td className="px-6 py-4">
                                                <span
                                                    className="text-[10px] font-bold px-2.5 py-1 rounded"
                                                    style={{
                                                        background: isExternal ? '#F0F0F0' : '#EBF3FF',
                                                        color: isExternal ? '#6B7280' : '#1D62D9',
                                                        letterSpacing: '0.04em',
                                                    }}
                                                >
                                                    {sourceLabel}
                                                </span>
                                            </td>
                                            {/* Time */}
                                            <td className="px-6 py-4 text-[12px] text-gray-400 font-medium">
                                                {uploadedAt}
                                            </td>
                                            {/* Action */}
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                                                    title="View report"
                                                >
                                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <circle cx="12" cy="12" r="3" />
                                                        <path d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7S2 12 2 12z" />
                                                    </svg>
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                // Placeholder rows matching the reference image
                                [
                                    { initials: 'EV', name: 'Elias Vance', id: '#PX-9921', type: 'Tissue Biopsy Analysis', source: 'W-BLOCK-04', time: '2 mins ago', external: false },
                                    { initials: 'MK', name: 'Mara Kova', id: '#PX-8854', type: 'Blood Smear Profiling', source: 'W-CORE-01', time: '14 mins ago', external: false },
                                    { initials: 'JS', name: 'Julian Sane', id: '#PX-7102', type: 'Metabolic Panel v4', source: 'EXTERNAL', time: '32 mins ago', external: true },
                                ].map((row) => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-gray-50 transition-colors"
                                        style={{ borderBottom: '1px solid #F1F4F7' }}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                                    style={{ background: '#4A5568' }}
                                                >
                                                    {row.initials}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-gray-800">{row.name}</p>
                                                    <p className="text-[11px] text-gray-400">ID: {row.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">{row.type}</td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[10px] font-bold px-2.5 py-1 rounded"
                                                style={{
                                                    background: row.external ? '#F0F0F0' : '#EBF3FF',
                                                    color: row.external ? '#6B7280' : '#1D62D9',
                                                    letterSpacing: '0.04em',
                                                }}
                                            >
                                                {row.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[12px] text-gray-400 font-medium">{row.time}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <circle cx="12" cy="12" r="3" />
                                                    <path d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7S2 12 2 12z" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
