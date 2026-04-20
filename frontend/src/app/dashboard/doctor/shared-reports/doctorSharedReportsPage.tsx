'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import AudioPlayer from '@/components/ui/AudioPlayer';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';

const FILTER_TABS = ['All Reports', 'Hematology', 'Cardiology', 'Neurology', 'Urgent Review'];

function getReportStatus(report: any): { label: string; pillClass: string } {
  // Check if any biomarker has a critical or abnormal status
  const hasCritical = Object.values(report.extractedData || {}).some(
    (b: any) => typeof b === 'object' && (b.severity === 'Critical' || b.isAbnormal)
  );

  if (report.doctorComment) {
    return {
      label: 'REVIEWED',
      pillClass: 'bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-3 py-1 rounded-lg tracking-widest uppercase',
    };
  }

  if (hasCritical) {
    return {
      label: 'URGENT REVIEW',
      pillClass: 'bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg tracking-widest uppercase shadow-sm animate-pulse',
    };
  }

  return {
    label: 'PENDING REVIEW',
    pillClass: 'bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg tracking-widest uppercase',
  };
}

const ICON_CONFIGS = [
  {
    bg: 'bg-amber-100',
    color: 'text-amber-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h6m-6 0v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4m0 0h4"/>
      </svg>
    ),
  },
  {
    bg: 'bg-[#8FB9A8]/20',
    color: 'text-[#4F6F6F]',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    bg: 'bg-slate-200',
    color: 'text-slate-600',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/>
      </svg>
    ),
  },
];

function getBioStatus(key: string, val: any) {
  // If val is the new object structure from the backend
  if (val && typeof val === 'object' && val.hasOwnProperty('value')) {
    if (val.isAbnormal) {
      const sev = val.severity || 'Abnormal';
      if (sev === 'Critical') return { label: 'CRITICAL', cls: 'bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-[0.1em] shadow-sm' };
      if (sev === 'Moderate') return { label: 'MODERATE', cls: 'bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider' };
      if (sev === 'Mild') return { label: 'MILD', cls: 'bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider' };
      return { label: sev.toUpperCase(), cls: 'text-red-500 text-[11px] font-bold' };
    }
    return { label: 'NORMAL', cls: 'bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider' };
  }

  // Fallback for legacy data/simple values
  const v = parseFloat(String(val));
  if (isNaN(v)) return { label: 'NORMAL', cls: 'text-gray-400 text-sm' };
  const k = key.toLowerCase();
  
  if (k.includes('glucose') && v > 99 && v <= 125) return { label: 'MODERATE', cls: 'bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-bold px-2.5 py-1 rounded-md' };
  if (k.includes('glucose') && v > 125) return { label: 'CRITICAL', cls: 'bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-md' };
  
  return { label: 'NORMAL', cls: 'bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2.5 py-1 rounded-md' };
}

export default function DoctorSharedReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Reports');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState<string | null>(null);

  useEffect(() => {
    api.get('/doctor/shared-reports')
      .then(res => {
        const data = res.data || [];
        setReports(data);
        if (data.length > 0) setExpanded(data[0]._id);
      })
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
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(null);
    }
  };

  const filtered = reports.filter(r => {
    if (activeFilter === 'All Reports') return true;
    if (activeFilter === 'Urgent Review') return !r.doctorComment;
    return (r.testType || r.category || '').toLowerCase().includes(activeFilter.toLowerCase());
  });

  return (
    <div className="-m-8 bg-[#F6F7F5] min-h-screen pb-16">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between px-10 pt-10 pb-7">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Reports Management</h1>
          <p className="text-sm text-gray-400 mt-1 font-medium">Centralized diagnostic vault for collaborative clinical review.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#4F6F6F] hover:bg-[#1F2933] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload New
        </button>
      </div>

      {/* ── Filter Pills ── */}
      <div className="flex items-center gap-2.5 px-10 pb-7 flex-wrap">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-1">Filter by:</span>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`text-[13px] font-semibold px-4 py-1.5 rounded-full border transition-all ${
              activeFilter === tab
                ? 'bg-[#F5C842] text-[#1a1000] border-[#F5C842] shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Report Cards ── */}
      <div className="px-10 space-y-5">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-[#8FB9A8]/20 border-t-[#4F6F6F] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100/80 py-24 text-center">
            <p className="font-bold text-gray-500 text-base">No reports available</p>
            <p className="text-sm text-gray-400 mt-1">Reports shared by patients will appear here.</p>
          </div>
        ) : filtered.map((report, idx) => {
          const patientName = typeof report.patientId === 'object' ? report.patientId?.name : 'Unknown Patient';
          const date = new Date(report.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const isExpanded = expanded === report._id;
          const refNum = `#${(report.testType || 'RPT').substring(0, 3).toUpperCase()}-${String(report._id).slice(-5).toUpperCase()}`;
          const { label: statusLabel, pillClass } = getReportStatus(report);
          const iconCfg = ICON_CONFIGS[idx % ICON_CONFIGS.length];

          return (
            <div
              key={report._id}
              className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100/80 overflow-hidden transition-all duration-300"
            >
              {/* ── Card Header ── */}
              <div
                className="flex items-center gap-5 px-7 py-5 cursor-pointer hover:bg-gray-50/60 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : report._id)}
              >
                {/* Round icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconCfg.bg} ${iconCfg.color}`}>
                  {iconCfg.icon}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-[15px] leading-snug">{report.reportName}</p>
                  <div className="flex items-center gap-4 mt-1 text-[12px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {patientName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>
                      {date}
                    </span>
                  </div>
                </div>

                {/* Status + Ref + toggle */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className={pillClass}>{statusLabel}</span>
                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Ref: {refNum}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${
                    isExpanded
                      ? 'border-gray-300 text-gray-500 bg-gray-50'
                      : 'border-gray-200 text-gray-400 bg-white hover:border-[#4F6F6F]/50 hover:text-[#4F6F6F]'
                  }`}>
                    {isExpanded
                      ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                      : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    }
                  </div>
                </div>
              </div>

              {/* ── Expanded Body ── */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-[#F8F9FC] px-7 py-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                    {/* LEFT — AI Insight + Audio */}
                    <div className="space-y-4">

                      {/* AI Clinical Insight card — always shown */}
                      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">
                        {/* Dark gradient header */}
                        <div className="flex items-center gap-2.5 px-5 py-3"
                          style={{ background: 'linear-gradient(90deg, #2D3748 0%, #4A5568 100%)' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F5C842" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                          </svg>
                          <span className="text-[11px] font-bold text-[#F5C842] uppercase tracking-[0.15em]">AI Clinical Insight</span>
                        </div>
                        {/* Body */}
                        <div className="px-5 py-4">
                          {report.aiSummary ? (
                            <p
                              className="text-[13px] text-gray-600 leading-relaxed"
                              dangerouslySetInnerHTML={{
                                __html: report.aiSummary
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .slice(0, 380) + (report.aiSummary.length > 380 ? '…' : '')
                              }}
                            />
                          ) : (
                            <p className="text-[13px] text-gray-400 leading-relaxed italic">
                              Analysis pending. The AI model is processing this report to extract clinical insights and biomarker correlations.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Audio Summary Player */}
                      <div className="bg-[#F6F7F5] rounded-2xl border border-[#8FB9A8]/20 p-5">
                         <VoiceSummaryButton 
                            reportId={report._id}
                            label="Clinical Brief"
                         />
                         <p className="text-[10px] text-gray-400 mt-2 font-medium">Rachel V2.1 AI Engine generated clinical vocalization.</p>
                      </div>
                    </div>

                    {/* RIGHT — Biomarker Table */}
                    <div>
                      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-gray-100 overflow-hidden">
                        {/* Table head */}
                        <div className="grid grid-cols-4 px-5 py-3 border-b border-gray-100">
                          {['Biomarker', 'Result', 'Reference', 'Status'].map(h => (
                            <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</span>
                          ))}
                        </div>
                        {/* Rows */}
                        {report.extractedData && Object.keys(report.extractedData).length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {Object.entries(report.extractedData).slice(0, 10).map(([key, val]: [string, any]) => {
                              const bs = getBioStatus(key, val);
                              const isRich = typeof val === 'object' && val !== null;
                              const displayVal = isRich ? `${val.value} ${val.unit}` : val;
                              const range = isRich && (val.min !== undefined || val.max !== undefined) 
                                ? `${val.min ?? '0'} - ${val.max ?? '∞'} ${val.unit}`
                                : '—';

                              return (
                                <div key={key} className="grid grid-cols-4 px-5 py-3.5 items-center hover:bg-gray-50/60 transition-colors">
                                  <span className="text-[13px] text-gray-700 font-medium">{key}</span>
                                  <span className={`text-[13px] font-bold ${bs.label === 'CRITICAL' || bs.label === 'Abnormal' || bs.label === 'High'  ? 'text-red-500' : 'text-gray-800'}`}>{displayVal}</span>
                                  <span className="text-[12px] text-gray-400">{range}</span>
                                  <span className={bs.cls}>{bs.label}</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="px-5 py-8 text-center">
                            <p className="text-sm text-gray-400 italic">No structured biomarker data extracted.</p>
                          </div>
                        )}
                      </div>

                      {/* Action row */}
                      <div className="flex items-center gap-3 mt-4">
                        <button className="text-[13px] font-semibold text-[#4F6F6F] hover:underline transition-all px-1">
                          View Historical Trends
                        </button>
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                        >
                          Download Full PDF
                        </a>
                      </div>

                      {/* Clinical note */}
                      {report.doctorComment && (
                        <div className="mt-4 px-4 py-3 bg-[#8FB9A8]/10 rounded-xl border border-[#8FB9A8]/20">
                          <p className="text-[10px] font-bold text-[#4F6F6F] uppercase tracking-widest mb-1">Clinical Note</p>
                          <p className="text-sm text-gray-700 italic">"{report.doctorComment}"</p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-3">
                        <input
                          type="text"
                          placeholder="Add clinical note…"
                          value={savingNote === report._id ? '' : noteText}
                          onChange={e => setNoteText(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveNote(report._id)}
                          className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-[#4F6F6F]/30 focus:ring-2 focus:ring-[#8FB9A8]/10 transition-all"
                        />
                        <button
                          onClick={() => saveNote(report._id)}
                          disabled={savingNote === report._id}
                          className="px-5 py-2.5 bg-[#4F6F6F] hover:bg-[#1F2933] text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-50 shadow-sm"
                        >
                          {savingNote === report._id ? '…' : 'Save Note'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom Info Cards ── */}
      {!loading && filtered.length > 0 && (
        <div className="px-10 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Secure Shared Portal */}
          <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.07)] border border-gray-100 p-7 flex gap-6 items-start">
            <div className="w-20 h-20 shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><polyline points="9 12 11 14 15 10"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-[#4F6F6F] mb-2">Secure Shared Portal</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed mb-5">
                These reports are end-to-end encrypted and shared only within the HealthScan clinical network. Any modification to data is logged and attributed to the medical professional in charge.
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-[#8FB9A8]', 'bg-purple-300', 'bg-green-300'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white shadow-sm`} />
                  ))}
                  <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-gray-500">+12</div>
                </div>
                <span className="text-[12px] text-gray-400 font-medium">Collaborators with access</span>
              </div>
            </div>
          </div>

          {/* Automated Alert Thresholds */}
          <div className="bg-[#FFF8D6] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-yellow-100 p-7">
            <div className="w-11 h-11 bg-amber-200 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#92400E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
              </svg>
            </div>
            <h3 className="text-[15px] font-bold text-gray-800 mb-2">Automated Alert Thresholds</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed mb-6">
              Configure your notification triggers for abnormal biomarker readings directly from patient profiles.
            </p>
            <button className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-gray-700 hover:text-[#1E3799] transition-colors flex items-center gap-2">
              Configure Alerts
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
