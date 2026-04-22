'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doctorService } from '@/services/doctorService';
import DoctorPatientChat from '@/components/doctor/DoctorPatientChat';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';

// ── Tiny SVG Line Chart ──────────────────────────────────────────────────────
function MiniLineChart({ values }: { values: number[] }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 200, H = 60;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - ((v - min) / range) * (H - 8) - 4,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const lastVal = values[values.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14 overflow-visible">
      <path d={d} fill="none" stroke="#8B7000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point callout */}
      <circle cx={last[0]} cy={last[1]} r="5" fill="#F5C842" stroke="white" strokeWidth="2" />
      <rect x={last[0] - 18} y={last[1] - 22} width="36" height="16" rx="4" fill="#1a1000" />
      <text x={last[0]} y={last[1] - 10} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">
        {lastVal.toFixed ? lastVal.toFixed(1) : lastVal}
      </text>
    </svg>
  );
}

// ── Tiny Bar Chart ───────────────────────────────────────────────────────────
function MiniBarChart({ values }: { values: number[] }) {
  if (!values || values.length === 0) return null;
  const max = Math.max(...values) || 1;
  const W = 200, H = 60;
  const barW = (W / values.length) * 0.6;
  const gap = W / values.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14">
      {values.map((v, i) => {
        const h = (v / max) * (H - 4);
        const x = i * gap + gap * 0.2;
        return (
          <rect
            key={i}
            x={x} y={H - h} width={barW} height={h}
            rx="4"
            fill={i === values.length - 1 ? '#F5C842' : '#F5C84260'}
          />
        );
      })}
    </svg>
  );
}

// ── Session dot ──────────────────────────────────────────────────────────────
function SessionDot({ date, label, active, special }: { date: string; label: string; active?: boolean; special?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${
        special
          ? 'bg-[#F5C842] border-[#F5C842]'
          : active
            ? 'bg-[#2B4BC4] border-[#2B4BC4]'
            : 'bg-white border-gray-200'
      }`}>
        {special ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={active ? 'white' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </div>
      <div className="text-center">
        <p className={`text-[10px] font-bold uppercase tracking-wide ${active || special ? 'text-gray-800' : 'text-gray-400'}`}>{date}</p>
        <p className={`text-[9px] mt-0.5 ${special ? 'text-[#B8860B] font-bold uppercase tracking-wide' : 'text-gray-400'}`}>{label}</p>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const { id: patientId } = useParams() as { id: string };
  const [data, setData] = useState<any>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── ALL hooks must be before any early return ──────────────────────────────
  const [voiceLang, setVoiceLang] = useState<'en' | 'hi'>('en');
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await doctorService.getPatientDashboard(patientId);
        setData(result);
        if (result.reports?.length > 0) setSelectedReportId(result.reports[0]._id);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load patient data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Early returns (after all hooks) ───────────────────────────────────────
  if (loading) {
    return (
      <div className="-m-8 min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--border)] border-t-[#F5C842] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="-m-8 min-h-screen bg-white flex flex-col items-center justify-center gap-4 text-center px-8">
        <h2 className="text-xl font-bold text-gray-800">Could not load intelligence data</h2>
        <p className="text-gray-500 text-sm max-w-md">{error || 'No data available for this patient.'}</p>
        <Link href="/dashboard/doctor/patients" className="text-sm font-semibold text-[#2B4BC4] hover:underline mt-2">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Patient AI Insights: ${data?.patient?.name || ''}`;

  const { patient, reports, trends } = data;
  const selectedReport = reports.find((r: any) => r._id === selectedReportId) || reports[0];

  // DYNAMIC: Build session timeline from real reports
  const sessions = reports.slice(0, 6).map((r: any) => ({
    _id: r._id,
    date: new Date(r.uploadDate || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase(),
    label: r.testType || r.reportName || 'Report',
    hasAbnormal: (r.abnormalities?.length ?? 0) > 0,
  }));

  // DYNAMIC: ALL biomarker trends (not limited to 2)
  const trendEntries = Object.entries(
    trends.reduce((acc: any, t: any) => { acc[t.parameter] = t.values.map((v: any) => v.value); return acc; }, {})
  ) as [string, number[]][];

  // AI correlation text from most recent report
  const aiText = selectedReport?.ai?.summary || 'The AI Engine is analyzing longitudinal changes in this patient\'s biomarker data. Full report will be available once processing is complete.';

  return (
    <div className="-m-8 bg-[#F8F9FD] min-h-screen">

      {/* ── Top breadcrumb strip ── */}
      <div className="bg-white border-b border-gray-100 px-10 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[12px] text-gray-400">
            <Link href="/dashboard/doctor" className="hover:text-[#2B4BC4] transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/dashboard/doctor/patients" className="hover:text-[#2B4BC4] transition-colors">Biomarker Analysis</Link>
            <span>/</span>
            <span className="font-semibold text-[#B8860B]">{patient.name}</span>
          </div>
          <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100/50 shadow-sm">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trajectory AI</span>
            {/* EN/HI Toggle */}
            <div className="flex rounded-full border border-gray-200 overflow-hidden text-[9.5px] font-black">
              <button onClick={() => setVoiceLang('en')} className={`px-2.5 py-1 transition-colors ${voiceLang === 'en' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:text-gray-700'}`}>EN</button>
              <button onClick={() => setVoiceLang('hi')} className={`px-2.5 py-1 transition-colors ${voiceLang === 'hi' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:text-gray-700'}`}>HI</button>
            </div>
            <VoiceSummaryButton patientId={patientId} label="Overall Analysis" lang={voiceLang} />
          </div>
        </div>
      </div>

      <div className="px-10 py-8">

        {/* ── Page Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
              Patient AI Insights:{' '}
              <span className="text-[#B8860B]">{patient.name}</span>
            </h1>
            <p className="text-[13px] text-gray-400 mt-2 max-w-xl leading-relaxed">
              Visualizing historical metabolic data and longitudinal trends generated via HealthScan V2.0.4 clinical engine.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {selectedReportId && (
              <VoiceSummaryButton reportId={selectedReportId} label="Report Summary" lang={voiceLang} />
            )}
            {/* Share / Export — WORKING popover */}
            <div className="relative" ref={shareRef}>
              <button
                onClick={() => setShareOpen(o => !o)}
                className="flex items-center gap-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Export Analysis
              </button>
              {shareOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 w-[190px] bg-white rounded-[18px] shadow-[0_8px_36px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-[9.5px] font-black text-gray-400 uppercase tracking-[0.14em]">Share via</p>
                    <p className="text-[11.5px] font-bold text-gray-800 truncate mt-0.5">{patient.name} — AI Insights</p>
                  </div>
                  <div className="py-1.5">
                    {[
                      { id:'wa',  label:'WhatsApp', color:'#25D366', onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank') },
                      { id:'em',  label:'Email',    color:'#EA4335', onClick: () => window.open(`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`, '_blank') },
                      { id:'tg',  label:'Telegram', color:'#2AABEE', onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank') },
                    ].map(ch => (
                      <button key={ch.id} onClick={() => { ch.onClick(); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                        <span style={{ color: ch.color, fontSize: 14, fontWeight: 700 }}>{ch.label[0]}</span>
                        <span className="text-[12.5px] font-semibold text-gray-700">{ch.label}</span>
                      </button>
                    ))}
                    <div className="h-px bg-gray-100 mx-3 my-1" />
                    <button onClick={async () => { await navigator.clipboard.writeText(shareUrl); setShareCopied(true); setTimeout(() => { setShareCopied(false); setShareOpen(false); }, 1800); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left">
                      <span style={{ color: shareCopied ? 'var(--primary)' : 'var(--muted-foreground)' }}>🔗</span>
                      <span className={`text-[12.5px] font-semibold ${shareCopied ? 'text-[var(--primary)]' : 'text-gray-700'}`}>{shareCopied ? 'Copied!' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="flex items-center gap-2.5 bg-[#F5C842] text-[#1a1000] font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:bg-[#f0c030] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Update Biomarkers
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left + Center (2/3) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Session History Card */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
                  </svg>
                  <h2 className="text-[15px] font-bold text-gray-800">Session History</h2>
                </div>
                {reports.length > 0 && (
                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest">
                    Latest Session: {new Date(reports[0].uploadDate || reports[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Timeline scroll — DYNAMIC from real reports */}
              <div className="flex items-start gap-6 overflow-x-auto pb-2 pt-1 px-2">
                {sessions.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4">No sessions recorded yet.</p>
                ) : sessions.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedReportId(s._id)}
                    className="flex flex-col items-center gap-2 shrink-0 group"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-sm transition-all ${
                      selectedReportId === s._id
                        ? s.hasAbnormal ? 'bg-[#F5C842] border-[#F5C842]' : 'bg-[#2B4BC4] border-[#2B4BC4]'
                        : 'bg-white border-gray-200 group-hover:border-blue-300'
                    }`}>
                      {s.hasAbnormal ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={selectedReportId === s._id ? 'white' : '#F5C842'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={selectedReportId === s._id ? 'white' : '#9CA3AF'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </div>
                    <div className="text-center max-w-[80px]">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-700">{s.date}</p>
                      <p className={`text-[9px] mt-0.5 truncate ${s.hasAbnormal ? 'text-[#B8860B] font-bold uppercase' : 'text-gray-400'}`}>{s.label}</p>
                    </div>
                  </button>
                ))}
                {reports.length > 6 && (
                  <div className="flex flex-col items-center gap-2 shrink-0 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-[#F5C842] border-2 border-[#F5C842] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                    </div>
                    <p className="text-[9px] text-[#B8860B] font-bold uppercase tracking-wide">+{reports.length - 6} More</p>
                  </div>
                )}
              </div>
            </div>

            {/* DYNAMIC: ALL biomarker trend cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {trendEntries.length === 0 ? (
                <div className="col-span-2 bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center shadow-sm">
                  <p className="text-sm text-gray-400">No biomarker trends available yet.</p>
                </div>
              ) : trendEntries.map(([name, values], idx) => {
                const unit = trends.find((t: any) => t.parameter === name)?.values?.[0]?.unit || '';
                const latest = values[values.length - 1] ?? 0;
                const prev = values[values.length - 2] ?? latest;
                const pct = prev !== 0 ? (((latest - prev) / prev) * 100).toFixed(1) : '0.0';
                const isDown = parseFloat(pct) < 0;
                const useBar = idx % 2 === 0;
                const isAbnormal = trends.find((t: any) => t.parameter === name)?.values?.slice(-1)[0]?.isAbnormal;

                return (
                  <div key={name} className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100 p-5 overflow-hidden">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Biomarker Trend</p>
                          {isAbnormal && <span className="text-[8px] font-black bg-red-50 text-red-600 border border-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Abnormal</span>}
                        </div>
                        <h3 className="text-lg font-extrabold text-gray-900 leading-tight capitalize">{name.replace(/_/g, ' ')}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-gray-800 leading-none">
                          {typeof latest === 'number' ? latest.toFixed(1) : latest}
                          <span className="text-sm font-medium text-gray-400 ml-1">{unit}</span>
                        </p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[11px] font-bold ${isDown ? 'text-green-600' : 'text-[#B8860B]'}`}>
                          {isDown ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
                          )}
                          {pct}% {isDown ? 'Stabilizing' : 'Increasing'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      {useBar ? <MiniBarChart values={values.slice(-5)} /> : <MiniLineChart values={values.slice(-10)} />}
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">
                        {new Date(trends.find((t: any) => t.parameter === name)?.values?.slice(-1)[0]?.date || Date.now()).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI Correlation Analysis */}
            <div className="bg-[#FFFBEA] rounded-2xl border border-[var(--border)] shadow-[0_4px_24px_rgba(245,200,66,0.15)] p-6">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 bg-[#F5C842] rounded-xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1a1000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-1">HealthScan AI Correlation Analysis</h3>
                  <p className="text-[13px] text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: aiText
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>')
                        .replace(/AI Engine/g, '<strong class="text-gray-900">AI Engine</strong>')
                        .slice(0, 400) + (aiText.length > 400 ? '…' : '')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Right column (1/3) ── */}
          <div className="space-y-5">

            {/* Clinical Report Preview */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h3 className="text-[14px] font-bold text-gray-800">Clinical Report</h3>
                <button className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3 9 15"/><path d="M3 21 9 15"/>
                  </svg>
                </button>
              </div>

              {/* PDF preview panel */}
              {selectedReport?.fileUrl ? (
                <div className="relative bg-gray-100 overflow-hidden" style={{ height: '220px' }}>
                  <iframe
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedReport.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-none scale-75 origin-top-left"
                    style={{ width: '133%', pointerEvents: 'none' }}
                  />
                  {/* Bottom overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent h-16" />
                  {/* Awaiting validation badge */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Awaiting Validation</p>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 py-2 border border-red-200 text-red-500 text-[11px] font-bold rounded-lg hover:bg-red-50 transition-all">
                        Flag Concern
                      </button>
                      <button className="flex-1 py-2 bg-[#F5C842] text-[#1a1000] text-[11px] font-bold rounded-lg hover:bg-[#f0c030] transition-all">
                        Validate Analysis
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-gray-50 flex flex-col items-center justify-center gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p className="text-xs text-gray-400 font-medium">No report file available</p>
                  <div className="flex items-center gap-2 px-5">
                    <button className="flex-1 py-2 border border-red-200 text-red-500 text-[11px] font-bold rounded-lg hover:bg-red-50 transition-all">
                      Flag Concern
                    </button>
                    <button className="flex-1 py-2 bg-[#F5C842] text-[#1a1000] text-[11px] font-bold rounded-lg hover:bg-[#f0c030] transition-all">
                      Validate Analysis
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Data Verified Sources */}
            <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100 p-5">
              <h3 className="text-[13px] font-extrabold text-gray-800 uppercase tracking-wider mb-4">Data Verified Sources</h3>
              {/* DYNAMIC sources */}
              <div className="space-y-3">
                {/* Source 1 — always show report ref */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[var(--accent-soft)] transition-all cursor-pointer group">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2B4BC4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800">{selectedReport?.pathologyId?.name || 'Clinical Lab'}</p>
                    <p className="text-[10px] text-gray-400">Ref ID: {selectedReport?._id ? String(selectedReport._id).slice(-6).toUpperCase() : '—'}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>

                {/* Source 2 — HealthScan AI pipeline */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[var(--accent-soft)] transition-all cursor-pointer group">
                  <div className="w-9 h-9 bg-[var(--accent)] rounded-full flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8860B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-800">HealthScan AI Engine</p>
                    <p className="text-[10px] text-gray-400">{reports?.length ? `${reports.length} reports analyzed` : 'Real-time sync active'}</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>

                {selectedReport?.pathologyId?.name && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-green-50 transition-all cursor-pointer group">
                    <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h6m-6 0v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4m0 0h4"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-gray-800">{selectedReport.pathologyId.name}</p>
                      <p className="text-[10px] text-gray-400">Verified Lab Partner</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                )}
              </div>
            </div>

            {/* Report Selector (if multiple reports) */}
            {reports.length > 1 && (
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100 p-5">
                <h3 className="text-[13px] font-extrabold text-gray-800 uppercase tracking-wider mb-3">All Reports</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {reports.map((r: any) => (
                    <button
                      key={r._id}
                      onClick={() => setSelectedReportId(r._id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-[12px] flex items-center gap-2 ${
                        selectedReportId === r._id
                          ? 'bg-[#2B4BC4] text-white font-semibold'
                          : 'hover:bg-gray-50 text-gray-600 border border-gray-100'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{r.reportName}</p>
                        <p className={`text-[10px] ${selectedReportId === r._id ? 'text-blue-100' : 'text-gray-400'}`}>
                          {new Date(r.uploadDate || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Clinical AI Chat — floating over the full dashboard */}
      <DoctorPatientChat
        patientId={patientId}
        patientName={patient.name}
        reportCount={reports.length}
      />
    </div>
  );
}
