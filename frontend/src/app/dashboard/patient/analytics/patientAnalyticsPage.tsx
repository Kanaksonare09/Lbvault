'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import api from '@/services/api';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  Normal:   { bg: 'bg-[var(--accent-soft)]', text: 'text-[var(--primary)]', dot: 'bg-[var(--primary)]', label: 'Normal' },
  Mild:     { bg: 'bg-[var(--accent-soft)]',  text: 'text-yellow-700',  dot: 'bg-yellow-400',  label: 'Mild' },
  Moderate: { bg: 'bg-[var(--accent-soft)]',   text: 'text-[var(--primary)]',   dot: 'bg-[var(--accent-soft)]0',   label: 'Moderate' },
  Critical: { bg: 'bg-rose-50',    text: 'text-rose-700',    dot: 'bg-rose-500',    label: 'Critical' },
};

const TREND_ICON: Record<string, string> = {
  Increasing: '↑',
  Decreasing: '↓',
  Stable:     '→',
};
const TREND_COLOR: Record<string, string> = {
  Increasing: 'text-rose-500',
  Decreasing: 'text-[var(--primary)]',
  Stable:     'text-[var(--muted-foreground)]',
};

const PIE_COLORS: Record<string, string> = {
  Normal: 'var(--primary)', Mild: 'var(--primary)', Moderate: 'var(--primary)', Critical: '#EF4444'
};

const BIOMARKER_COLORS = [
  'var(--primary)', '#6366F1', 'var(--primary)', 'var(--primary)', '#EC4899', '#8B5CF6', '#14B8A6', '#EF4444'
];

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function PatientAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBiomarker, setSelectedBiomarker] = useState('');

  useEffect(() => {
    const id = user?.id || user?._id;
    if (!authLoading && id) {
      api.get(`/analytics/${id}`)
        .then(res => {
          setData(res.data);
          const keys = Object.keys(res.data.trendMap || {});
          if (keys.length > 0) setSelectedBiomarker(keys[0]);
        })
        .catch(() => setError('Failed to load analytics. Please try again.'))
        .finally(() => setLoading(false));
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-[var(--primary)] border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="text-4xl">⚠️</div>
      <p className="text-rose-600 font-bold">{error}</p>
    </div>
  );

  if (!data || data.totalReports === 0) return (
    <div className="bg-white py-24 rounded-3xl border border-dashed border-[var(--border)] text-center">
      <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">📊</div>
      <h3 className="text-xl font-black text-[var(--foreground)]">No Reports Yet</h3>
      <p className="text-[var(--muted-foreground)] font-medium mt-2 max-w-sm mx-auto">
        Upload your lab reports to unlock health analytics, biomarker trends, and risk analysis.
      </p>
      <Link href="/dashboard/patient"
        className="inline-flex items-center gap-2 mt-6 bg-[var(--primary)] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)] transition-all">
        Upload a Report
      </Link>
    </div>
  );

  const { totalReports, totalBiomarkers, riskCounts, trendMap, latestSnapshot, reportTimeline } = data;

  // Pie chart data
  const pieData = Object.entries(riskCounts as Record<string, number>)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value, color: PIE_COLORS[name] }));

  // Trend chart data for selected biomarker
  const trendEntries: any[] = (trendMap[selectedBiomarker] || []).map((e: any) => ({
    ...e,
    label: new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));
  const trendBiomarkerColor = BIOMARKER_COLORS[Object.keys(trendMap).indexOf(selectedBiomarker) % BIOMARKER_COLORS.length];

  // Sort latestSnapshot: critical first
  const severityOrder: Record<string, number> = { Critical: 0, Moderate: 1, Mild: 2, Normal: 3 };
  const sortedSnapshot = [...(latestSnapshot || [])].sort((a, b) =>
    (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patient"
            className="p-3 bg-white border border-[var(--border)] rounded-2xl text-gray-500 hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Health Analytics</h1>
            <p className="text-[var(--muted-foreground)] mt-1 font-medium">
              Real-time biomarker trends and risk analysis from your reports.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reports', value: totalReports, icon: '📄', color: 'text-[var(--foreground)]' },
          { label: 'Biomarkers Tracked', value: totalBiomarkers, icon: '🔬', color: 'text-[var(--primary)]' },
          { label: 'Normal Values', value: riskCounts.Normal || 0, icon: '✅', color: 'text-emerald-600' },
          {
            label: 'Needs Attention',
            value: (riskCounts.Mild || 0) + (riskCounts.Moderate || 0) + (riskCounts.Critical || 0),
            icon: riskCounts.Critical > 0 ? '🚨' : '⚠️',
            color: riskCounts.Critical > 0 ? 'text-rose-600' : 'text-[var(--primary)]'
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
            <span className="text-whitexl">{stat.icon}</span>
            <p className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mt-3">{stat.label}</p>
            <p className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Trend Chart + Risk Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-black text-[var(--foreground)]">Biomarker Trend</h3>
              <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">
                {trendEntries.length > 0 ? `${trendEntries.length} data points` : 'Select a biomarker below'}
              </p>
            </div>
            {/* Biomarker selector pills */}
            <div className="flex flex-wrap gap-2">
              {Object.keys(trendMap).map((bm, i) => (
                <button key={bm} onClick={() => setSelectedBiomarker(bm)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    selectedBiomarker === bm ? 'text-white shadow-md' : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
                  }`}
                  style={selectedBiomarker === bm ? { background: BIOMARKER_COLORS[i % BIOMARKER_COLORS.length] } : {}}>
                  {capitalize(bm)}
                </button>
              ))}
            </div>
          </div>

          {trendEntries.length >= 2 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trendEntries}>
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={trendBiomarkerColor} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={trendBiomarkerColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: 'var(--foreground)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }}
                  formatter={(val: any) => [`${val} ${trendEntries[0]?.unit || ''}`, capitalize(selectedBiomarker)]}
                />
                <Area type="monotone" dataKey="value" stroke={trendBiomarkerColor} strokeWidth={2.5}
                  fill="url(#trendGrad)" dot={{ r: 4, fill: trendBiomarkerColor, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : trendEntries.length === 1 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white text-whitexl font-black"
                style={{ background: trendBiomarkerColor }}>
                {trendEntries[0].value}
              </div>
              <p className="text-sm font-bold text-[var(--muted-foreground)]">
                Latest: <span className="text-[var(--foreground)] font-black">{trendEntries[0].value} {trendEntries[0].unit}</span>
              </p>
              <p className="text-xs text-[#94A3B8] font-medium">Upload more reports to see a trend</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
              <div className="text-3xl">📊</div>
              <p className="font-black text-[var(--foreground)]">Select a biomarker above</p>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">Upload lab reports to start tracking biomarker trends.</p>
            </div>
          )}
        </div>

        {/* Risk Distribution Pie */}
        <div className="bg-white p-8 rounded-3xl border border-[var(--border)] shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-[var(--foreground)] mb-1">Risk Distribution</h3>
          <p className="text-xs text-[var(--muted-foreground)] font-medium mb-6">Across all biomarker readings</p>

          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                    paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--foreground)', border: 'none', borderRadius: 12, color: 'white', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-sm font-bold text-[var(--foreground)]">{d.name}</span>
                    </div>
                    <span className="text-sm font-black text-[var(--primary)]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-3 text-center">
              <div className="text-3xl">🥧</div>
              <p className="text-sm font-bold text-[var(--muted-foreground)]">No biomarker data</p>
              <p className="text-xs text-[#94A3B8]">Risk distribution will appear once reports are processed.</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Biomarker Snapshot Table */}
      {sortedSnapshot.length > 0 && (
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[var(--background)]">
            <h3 className="text-lg font-black text-[var(--foreground)]">Latest Biomarker Snapshot</h3>
            <p className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">Most recent value per biomarker across all your reports</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--background)]">
                <tr>
                  {['Biomarker', 'Latest Value', 'Unit', 'Reference Range', 'Trend', 'Status', 'Insight'].map(h => (
                    <th key={h} className="px-5 py-4 text-left text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--background)]">
                {sortedSnapshot.map((bm: any, i: number) => {
                  const sc = SEVERITY_CONFIG[bm.severity] || SEVERITY_CONFIG.Normal;
                  const trendIcon = TREND_ICON[bm.trend] || '→';
                  const trendColor = TREND_COLOR[bm.trend] || 'text-[var(--muted-foreground)]';
                  const color = BIOMARKER_COLORS[i % BIOMARKER_COLORS.length];

                  // Mini progress bar within reference range
                  const inRange = bm.referenceMin != null && bm.referenceMax != null && bm.referenceMax > bm.referenceMin;
                  const pct = inRange
                    ? Math.min(100, Math.max(0, ((bm.value - bm.referenceMin) / (bm.referenceMax - bm.referenceMin)) * 100))
                    : 50;

                  return (
                    <tr key={bm.name} className="hover:bg-[var(--background)] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                          <span className="font-black text-[var(--foreground)] text-sm capitalize">{bm.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-black text-[var(--foreground)] text-sm">{bm.value}</td>
                      <td className="px-5 py-4 text-xs text-[var(--muted-foreground)] font-medium">{bm.unit || '—'}</td>
                      <td className="px-5 py-4">
                        {inRange ? (
                          <div className="flex items-center gap-2 w-36">
                            <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: bm.severity === 'Normal' ? 'var(--primary)' : bm.severity === 'Critical' ? '#EF4444' : 'var(--primary)' }} />
                            </div>
                            <span className="text-[10px] font-bold text-[#94A3B8] whitespace-nowrap">
                              {bm.referenceMin}–{bm.referenceMax}
                            </span>
                          </div>
                        ) : <span className="text-xs text-[#94A3B8]">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-black ${trendColor}`}>
                          {trendIcon} {bm.trend}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 w-fit ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 max-w-xs">
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed truncate" title={bm.interpretation}>
                          {bm.interpretation || '—'}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Timeline */}
      {reportTimeline?.length > 0 && (
        <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm p-8">
          <h3 className="text-lg font-black text-[var(--foreground)] mb-6">Report Upload Timeline</h3>
          <div className="space-y-3">
            {[...reportTimeline].reverse().map((r: any) => (
          <Link key={r._id} href={`/dashboard/patient/reports/${r._id}`}
                className="flex items-center justify-between p-4 rounded-2xl border border-[#F1F5F9] hover:border-[var(--primary)] hover:bg-[var(--accent-soft)] transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-lg flex-shrink-0">📋</div>
                  <div>
                    <p className="font-black text-[var(--foreground)] text-sm group-hover:text-[var(--primary)] transition-colors">{r.reportName}</p>
                    <p className="text-[10px] text-[var(--muted-foreground)] font-medium mt-0.5">
                      {r.testType} · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-black text-[var(--foreground)]">{r.biomarkerCount} biomarkers</p>
                    {r.abnormalCount > 0 && (
                      <p className="text-[10px] font-bold text-[var(--primary)]">{r.abnormalCount} abnormal</p>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
