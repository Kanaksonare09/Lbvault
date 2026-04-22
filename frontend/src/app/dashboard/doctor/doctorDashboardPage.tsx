'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { patientService } from '@/services/patientService';
import { Patient } from '@/types';
import api from '@/services/api';
import DoctorPatientChat from '@/components/doctor/DoctorPatientChat';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';

// ─── HealthScan Design Tokens — exact match to login page ─────────────────────
// Login page uses: bg=var(--background), btn=var(--primary) (--primary), text=var(--foreground),
// accent/links=var(--primary), subtext=var(--muted-foreground), borders=var(--border)
const CLR = {
  primary:    'var(--primary)',
  primaryHov: '#3B4D36',
  sage:       'var(--primary)',
  sageBg:     'rgba(144, 161, 125, 0.1)',
  secondary:  'var(--secondary)',
  bg:         'var(--background)',
  card:       '#FFFFFF',
  border:     'var(--border)',
  dark:       'var(--foreground)',
  muted:      'var(--muted-foreground)',
  mutedLight: '#94A3B8',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Biomarker {
  _id: string;
  biomarkerName: string;
  value: number;
  unit: string;
  referenceMin: number;
  referenceMax: number;
  isAbnormal: boolean;
  severity: 'Normal' | 'Mild' | 'Moderate' | 'Critical';
  interpretation?: string;
  trend?: string;
  comparison?: {
    previousValue: number;
    trendDirection: 'up' | 'down' | 'stable';
    improvementStatus: 'improving' | 'deteriorating' | 'neutral';
  } | null;
}

interface EnrichedReport {
  _id: string;
  reportName: string;
  testType: string;
  uploadDate: string;
  createdAt: string;
  status: string;
  fileUrl: string;
  doctorComment?: string;
  doctorNotes?: { note: string; doctorId: string; createdAt: string }[];
  biomarkers: Biomarker[];
  abnormalities: Biomarker[];
  ai: { summary: string; ocrText?: string } | null;
}

interface DashboardData {
  patient: { _id: string; name: string; email: string; lvId?: string };
  reports: EnrichedReport[];
  trends: { parameter: string; values: { value: number; unit: string; date: string; isAbnormal: boolean }[] }[];
}

interface ChatMessage { role: 'doctor' | 'ai'; text: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeRisk(r: EnrichedReport | null) {
  if (!r) return 'Low';
  const c = r.abnormalities?.filter(b => b.severity === 'Critical').length ?? 0;
  const a = r.abnormalities?.length ?? 0;
  if (c >= 2) return 'Critical';
  if (c >= 1) return 'High';
  if (a >= 3)  return 'Medium';
  return 'Low';
}

function RiskBadge({ score }: { score: string }) {
  const m: Record<string, { lbl: string; style: React.CSSProperties }> = {
    Low:      { lbl: '✓ Low Risk',    style: { background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' } },
    Medium:   { lbl: '⚠ Medium Risk', style: { background: 'var(--accent-soft)', color: 'var(--primary)', border: '1px solid #FDE68A' } },
    High:     { lbl: '↑ High Risk',   style: { background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7' } },
    Critical: { lbl: '! Critical',    style: { background: '#FFF5F5', color: '#9B1C1C', border: '1px solid #FC8181' } },
  };
  const { lbl, style } = m[score] ?? m.Low;
  return (
    <span style={{ ...style, fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center' }}>
      {lbl}
    </span>
  );
}

function StatusBadge({ b }: { b: Biomarker }) {
  if (b.severity === 'Critical') return <span style={{ background: '#FFF5F5', color: '#9B1C1C', border: '1px solid #FC8181', fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: '#E53E3E', display: 'inline-block', animation: 'pulse 2s infinite' }}/>Critical</span>;
  if (!b.isAbnormal)             return <span style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--primary)', display: 'inline-block' }}/>Normal</span>;
  if (b.value > b.referenceMax)  return <span style={{ background: '#FFF5F5', color: '#C53030', border: '1px solid #FED7D7', fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: '#FC8181', display: 'inline-block' }}/>High</span>;
  return <span style={{ background: 'var(--accent-soft)', color: 'var(--primary)', border: '1px solid #FDE68A', fontSize: 10, fontWeight: 800, padding: '2px 10px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: '#D69E2E', display: 'inline-block' }}/>Low</span>;
}

function TrendArrow({ b }: { b: Biomarker }) {
  const dir = b.comparison?.trendDirection ?? (b.trend === 'Increasing' ? 'up' : b.trend === 'Decreasing' ? 'down' : 'stable');
  const imp = b.comparison?.improvementStatus ?? 'neutral';
  if (dir === 'up')   return <span style={{ color: imp === 'improving' ? 'var(--primary)' : '#E53E3E', fontWeight: 800, fontSize: 16 }}>↑</span>;
  if (dir === 'down') return <span style={{ color: imp === 'improving' ? 'var(--primary)' : '#D69E2E', fontWeight: 800, fontSize: 16 }}>↓</span>;
  return <span style={{ color: CLR.mutedLight, fontWeight: 800, fontSize: 16 }}>→</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DoctorDashboard() {
  const { user } = useAuth();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010';

  const [patients,        setPatients]        = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [search,          setSearch]          = useState('');
  const [selectedPt,      setSelectedPt]      = useState<Patient | null>(null);

  const [dashData,        setDashData]        = useState<DashboardData | null>(null);
  const [dashLoading,     setDashLoading]     = useState(false);
  const [dashError,       setDashError]       = useState('');

  const [selectedReport,  setSelectedReport]  = useState<EnrichedReport | null>(null);

  const [noteText,        setNoteText]        = useState('');
  const [savingNote,      setSavingNote]      = useState(false);
  const [noteSaved,       setNoteSaved]       = useState(false);

  // Removed obsolete chat and voice manual state (handled by FABs)

  useEffect(() => {
    patientService.getDoctorPatients()
      .then(data => { const l = data || []; setPatients(l); if (l.length > 0) loadPatient(l[0]); })
      .catch(console.error)
      .finally(() => setPatientsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPatient = useCallback(async (p: Patient) => {
    setSelectedPt(p); setDashData(null); setSelectedReport(null);
    setDashError(''); setDashLoading(true);
    try {
      const res = await api.get(`/doctor/patient/${p._id}/dashboard`);
      setDashData(res.data);
      if (res.data.reports?.length > 0) setSelectedReport(res.data.reports[0]);
    } catch (e: any) { setDashError(e?.response?.data?.message || 'Failed to load patient data.'); }
    finally { setDashLoading(false); }
  }, []);

  useEffect(() => { setNoteText(''); setNoteSaved(false); }, [selectedReport?._id]);

  const saveNote = async () => {
    if (!noteText.trim() || !selectedReport) return;
    setSavingNote(true);
    try {
      await api.post(`/doctor/reports/${selectedReport._id}/note`, { note: noteText });
      setNoteSaved(true); setNoteText('');
      if (selectedPt) {
        const res = await api.get(`/doctor/patient/${selectedPt._id}/dashboard`);
        setDashData(res.data);
        const up = res.data.reports?.find((r: EnrichedReport) => r._id === selectedReport._id);
        if (up) setSelectedReport(up);
      }
    } catch (e) { console.error(e); }
    finally { setSavingNote(false); }
  };



  const filtered      = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    (p.lvId ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const riskScore   = computeRisk(selectedReport);
  const criticals   = selectedReport?.abnormalities?.filter(b => b.severity === 'Critical') ?? [];
  const allAbnormal = selectedReport?.abnormalities ?? [];
  const biomarkers  = selectedReport?.biomarkers ?? [];
  const aiSummary   = selectedReport?.ai?.summary ?? '';
  const latestNote  = selectedReport?.doctorNotes?.[selectedReport.doctorNotes.length - 1]?.note ?? selectedReport?.doctorComment ?? '';
  const doctorName  = user?.name?.split(' ').pop() ?? 'Doctor';

  const Spinner = () => (
    <div className="w-8 h-8 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'var(--primary)' }} />
  );

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="-m-8 min-h-screen flex flex-col" style={{ background: CLR.bg }}>

      {/* ────── TOP BAR ────── */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ background: CLR.card, borderBottom: `1px solid ${CLR.border}` }}>
        <div>
          <h1 className="text-base font-extrabold leading-none" style={{ color: CLR.dark }}>
            Dr. {doctorName}
            <span className="ml-2 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider"
              style={{ background: CLR.primary, color: '#fff' }}>VERIFIED</span>
          </h1>
          <p className="text-[11px] mt-0.5" style={{ color: CLR.muted }}>HealthScan Clinical Command Center</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedPt && (
            <Link href={`/dashboard/doctor/patient/${selectedPt._id}/dashboard`}
              className="flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-2xl transition-all uppercase tracking-widest shadow-md active:scale-95"
              style={{ background: CLR.primary, color: '#fff' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              Intelligence Hub
            </Link>
          )}
          <Link href="/dashboard/doctor/profile"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${CLR.dark} 0%, ${CLR.primary} 100%)` }}>
            {user?.name?.[0]?.toUpperCase() ?? 'D'}
          </Link>
        </div>
      </div>

      {/* ────── 3-COLUMN ────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 110px)' }}>

        {/* ══ COL 1 — PATIENTS ══ */}
        <div className="w-[228px] shrink-0 flex flex-col overflow-hidden"
          style={{ background: CLR.card, borderRight: `1px solid ${CLR.border}` }}>

          <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${CLR.border}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: CLR.muted }}>Authorized Patients</p>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: CLR.muted }}
                xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input type="text" placeholder="Name, LV-ID…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-2xl outline-none transition-all"
                style={{ background: CLR.bg, border: `1px solid ${CLR.border}`, color: CLR.dark }}
                onFocus={e => e.target.style.borderColor = CLR.primary}
                onBlur={e => e.target.style.borderColor = CLR.border} />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">
            {patientsLoading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 px-4">
                <p className="text-xs font-medium" style={{ color: CLR.muted }}>No authorized patients yet.</p>
                <p className="text-[10px] mt-1" style={{ color: CLR.mutedLight }}>Patients must share reports first.</p>
              </div>
            ) : filtered.map(p => {
              const active = selectedPt?._id === p._id;
              return (
                <button key={p._id} onClick={() => loadPatient(p)} className="w-full text-left px-3 py-3 flex items-center gap-3 transition-all"
                  style={active ? { background: CLR.sageBg, borderRight: `2px solid ${CLR.primary}` } : {}}>
                  <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: active ? `linear-gradient(135deg,${CLR.dark},${CLR.primary})` : `linear-gradient(135deg,${CLR.secondary},${CLR.primary})` }}>
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: active ? CLR.primary : CLR.dark }}>{p.name}</p>
                    <p className="text-[10px] font-mono truncate" style={{ color: CLR.muted }}>{p.lvId || p.email?.split('@')[0]}</p>
                  </div>
                  {active && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: CLR.primary }} />}
                </button>
              );
            })}
          </div>

          <div className="px-4 py-3" style={{ borderTop: `1px solid ${CLR.border}`, background: CLR.bg }}>
            <p className="text-[10px] font-semibold" style={{ color: CLR.muted }}>
              {patients.length} patient{patients.length !== 1 ? 's' : ''} granted access
            </p>
          </div>
        </div>

        {/* ══ COL 2 — REPORTS & ANALYSIS ══ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedPt ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-20 h-20 rounded-full flex items-center justify-center border border-[var(--border)]"
                style={{ background: CLR.sageBg }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={CLR.primary} strokeWidth="2">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <p className="text-sm font-semibold" style={{ color: CLR.muted }}>Select a patient to begin analysis</p>
            </div>
          ) : dashLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3"><Spinner />
              <p className="text-sm font-medium" style={{ color: CLR.muted }}>Loading patient data…</p>
            </div>
          ) : dashError ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center bg-red-50 border border-red-100 rounded-3xl p-8 max-w-sm">
                <p className="text-sm font-bold text-red-700">⚠️ {dashError}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">

              {/* Patient strip */}
              <div className="flex items-center gap-4 px-5 py-3 shrink-0"
                style={{ background: CLR.card, borderBottom: `1px solid ${CLR.border}` }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: `linear-gradient(135deg,${CLR.dark},${CLR.primary})` }}>
                  {selectedPt.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm" style={{ color: CLR.dark }}>{selectedPt.name}</p>
                    <RiskBadge score={riskScore} />
                  </div>
                  <p className="text-[11px]" style={{ color: CLR.muted }}>{selectedPt.lvId ?? selectedPt.email}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] font-bold" style={{ color: CLR.muted }}>{dashData?.reports?.length ?? 0} reports</p>
                  <p className="text-[11px] font-semibold text-red-500">{allAbnormal.length} abnormal</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* 🚨 CRITICAL ALERTS */}
                {criticals.length > 0 && (
                  <div className="rounded-3xl p-5 border border-red-100" style={{ background: '#FFF5F5' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                      <p className="text-xs font-black text-red-700 uppercase tracking-wider">🚨 Critical Alerts — Immediate Attention Required</p>
                    </div>
                    <div className="space-y-2">
                      {criticals.map(b => (
                        <div key={b._id} className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-red-100">
                          <div>
                            <p className="text-xs font-bold text-red-700 capitalize">{b.biomarkerName}</p>
                            {b.interpretation && <p className="text-[10px] text-red-400 mt-0.5">{b.interpretation}</p>}
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-sm font-black text-red-600 font-mono">{b.value} {b.unit}</p>
                            {b.referenceMax > 0 && <p className="text-[10px] text-red-400">Ref: {b.referenceMin}–{b.referenceMax}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 📄 SHARED REPORTS */}
                <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: CLR.card, border: `1px solid ${CLR.border}` }}>
                  <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${CLR.border}` }}>
                    <h3 className="text-sm font-black" style={{ color: CLR.dark }}>📄 Shared Reports</h3>
                    <span className="text-[11px]" style={{ color: CLR.muted }}>{dashData?.reports?.length ?? 0} total</span>
                  </div>
                  <div className="divide-y" style={{ borderColor: CLR.bg }}>
                    {(dashData?.reports ?? []).length === 0 ? (
                      <div className="py-10 text-center">
                        <p className="text-sm font-medium" style={{ color: CLR.muted }}>No reports shared yet.</p>
                      </div>
                    ) : (dashData?.reports ?? []).map((r, i) => {
                      const active = selectedReport?._id === r._id;
                      const date = new Date(r.uploadDate || r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
                      const abnCount = r.abnormalities?.length ?? 0;
                      const critCount = r.abnormalities?.filter(b => b.severity === 'Critical').length ?? 0;
                      return (
                        <button key={r._id} onClick={() => setSelectedReport(r)}
                          className="w-full text-left flex items-center gap-4 px-5 py-3.5 transition-all"
                          style={active
                            ? { background: CLR.sageBg, borderLeft: `4px solid ${CLR.primary}` }
                            : { borderLeft: '4px solid transparent' }}>
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: i === 0 ? CLR.primary : CLR.bg, color: i === 0 ? '#fff' : CLR.muted }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold truncate" style={{ color: CLR.dark }}>{r.reportName || r.testType}</p>
                            <p className="text-[11px] mt-0.5" style={{ color: CLR.muted }}>{date}</p>
                          </div>
                          {critCount > 0 && (
                            <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-100 px-2 py-1 rounded-full shrink-0">{critCount} critical</span>
                          )}
                          {abnCount > 0 && critCount === 0 && (
                            <span className="text-[10px] font-bold bg-[var(--accent-soft)] border border-[var(--border)] px-2 py-1 rounded-full shrink-0" style={{ color: 'var(--primary)' }}>{abnCount} abnormal</span>
                          )}
                          {r.fileUrl && (
                            <a href={`${apiBase}${r.fileUrl}`} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()} title="Download original file"
                              className="w-7 h-7 flex items-center justify-center rounded-xl transition-all shrink-0"
                              style={{ background: CLR.bg, color: CLR.muted }}
                              onMouseOver={e => { e.currentTarget.style.background = CLR.sageBg; e.currentTarget.style.color = CLR.primary; }}
                              onMouseOut={e => { e.currentTarget.style.background = CLR.bg; e.currentTarget.style.color = CLR.muted; }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                              </svg>
                            </a>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 🧠 AI OVERVIEW */}
                {aiSummary ? (
                  <div className="rounded-3xl p-5 shadow-md"
                    style={{ background: `linear-gradient(135deg, ${CLR.dark} 0%, ${CLR.primary} 100%)` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                        <span className="text-white text-[9px] font-black">AI</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: CLR.secondary }}>🧠 AI Patient Overview</p>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: `${CLR.secondary}cc` }}>
                      {aiSummary.replace(/<\/?[^>]+(>|$)/g, '').replace(/\*\*/g, '').slice(0, 420)}
                      {aiSummary.length > 420 && '…'}
                    </p>
                  </div>
                ) : selectedReport && (
                  <div className="rounded-3xl p-4 text-center border" style={{ background: CLR.sageBg, borderColor: `${CLR.secondary}50` }}>
                    <p className="text-sm font-semibold" style={{ color: CLR.primary }}>AI summary is being generated…</p>
                    <p className="text-xs mt-1" style={{ color: CLR.secondary }}>Will appear once the AI pipeline completes.</p>
                  </div>
                )}

                {/* 🧪 BIOMARKER TABLE */}
                {biomarkers.length > 0 && (
                  <div className="rounded-3xl overflow-hidden shadow-sm" style={{ background: CLR.card, border: `1px solid ${CLR.border}` }}>
                    <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${CLR.border}` }}>
                      <h3 className="text-sm font-black" style={{ color: CLR.dark }}>🧪 Biomarker Analysis</h3>
                      <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest">
                        {[['var(--primary)','Normal'],['#D69E2E','Low'],['#FC8181','High'],['#E53E3E','Critical']].map(([c,l]) => (
                          <span key={l} className="flex items-center gap-1" style={{ color: c }}>
                            <span style={{ width: 6, height: 6, borderRadius: 99, background: c, display: 'inline-block' }}/>
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr style={{ background: CLR.bg, borderBottom: `1px solid ${CLR.border}` }}>
                            {['Parameter','Value','Reference','Status','Trend'].map(h => (
                              <th key={h} className="px-4 py-3 text-left text-[9px] font-black uppercase tracking-widest" style={{ color: CLR.muted }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {biomarkers.map(b => (
                            <tr key={b._id} style={{
                              background: b.severity === 'Critical' ? '#FFF5F5' : b.isAbnormal ? 'var(--accent-soft)' : 'transparent',
                              borderBottom: `1px solid ${CLR.bg}`
                            }}>
                              <td className="px-4 py-3 font-semibold capitalize" style={{ color: CLR.dark }}>{b.biomarkerName}</td>
                              <td className="px-4 py-3 font-bold font-mono">
                                <span style={{ color: b.severity === 'Critical' ? '#C53030' : b.isAbnormal ? 'var(--primary)' : CLR.dark }}>{b.value}</span>
                                <span className="font-normal ml-1 text-[10px]" style={{ color: CLR.mutedLight }}>{b.unit}</span>
                              </td>
                              <td className="px-4 py-3 font-mono" style={{ color: CLR.muted }}>
                                {b.referenceMin !== undefined && b.referenceMax !== undefined && (b.referenceMin > 0 || b.referenceMax > 0)
                                  ? `${b.referenceMin} – ${b.referenceMax}`
                                  : <span style={{ color: CLR.border }}>—</span>}
                              </td>
                              <td className="px-4 py-3"><StatusBadge b={b} /></td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <TrendArrow b={b} />
                                  {b.comparison?.previousValue !== undefined && (
                                    <span className="text-[9px]" style={{ color: CLR.mutedLight }}>prev: {b.comparison.previousValue}</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 📝 CLINICAL NOTE */}
                {selectedReport && (
                  <div className="rounded-3xl p-5 shadow-sm" style={{ background: CLR.card, border: `1px solid ${CLR.border}` }}>
                    <h3 className="text-sm font-black mb-3" style={{ color: CLR.dark }}>📝 Clinical Note</h3>
                    {latestNote && (
                      <div className="rounded-2xl px-4 py-3 mb-3 border" style={{ background: CLR.sageBg, borderColor: `${CLR.secondary}50` }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: CLR.primary }}>Latest Note</p>
                        <p className="text-[13px] leading-relaxed italic" style={{ color: CLR.dark }}>"{latestNote}"</p>
                      </div>
                    )}
                    {noteSaved && (
                      <div className="text-[11px] font-bold mb-2 flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        Note saved successfully
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="Add clinical observation…"
                        value={noteText} onChange={e => setNoteText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && saveNote()}
                        className="flex-1 px-4 py-2.5 rounded-2xl text-xs outline-none transition-all"
                        style={{ background: CLR.bg, border: `1px solid ${CLR.border}`, color: CLR.dark }}
                        onFocus={e => e.target.style.borderColor = CLR.primary}
                        onBlur={e => e.target.style.borderColor = CLR.border} />
                      <button onClick={saveNote} disabled={savingNote || !noteText.trim()}
                        className="px-5 py-2.5 text-white text-xs font-black rounded-2xl transition-all disabled:opacity-40 active:scale-95 uppercase tracking-widest"
                        style={{ background: CLR.primary }}>
                        {savingNote ? '…' : 'Save'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ══ COL 3 — AI PANEL ══ */}
        <div className="w-[268px] shrink-0 flex flex-col overflow-hidden"
          style={{ background: CLR.card, borderLeft: `1px solid ${CLR.border}` }}>

          <div className="px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${CLR.border}` }}>
             <h3 className="text-sm font-black text-[var(--foreground)] uppercase flex items-center gap-2">
               🧠 AI Insights
             </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!selectedReport
                ? <p className="text-xs text-center mt-10" style={{ color: CLR.muted }}>Select a report to view AI insights.</p>
                : (
                  <>
                    <div className="rounded-3xl p-4 border" style={{ background: CLR.sageBg, borderColor: `${CLR.secondary}50` }}>
                      <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: CLR.muted }}>Risk Profile</p>
                      <RiskBadge score={riskScore} />
                      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                        {[
                          { n: biomarkers.length, lbl: 'Total', color: CLR.dark, border: CLR.border },
                          { n: allAbnormal.length, lbl: 'Abnormal', color: 'var(--primary)', border: '#FDE68A' },
                          { n: criticals.length, lbl: 'Critical', color: '#C53030', border: '#FED7D7' },
                        ].map(( { n, lbl, color, border }) => (
                          <div key={lbl} className="bg-white rounded-2xl p-2.5" style={{ border: `1px solid ${border}` }}>
                            <p className="text-lg font-black" style={{ color }}>{n}</p>
                            <p className="text-[9px] font-bold uppercase" style={{ color: CLR.muted }}>{lbl}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {allAbnormal.length > 0 ? (
                      <div className="rounded-3xl p-4 border border-[var(--border)]" style={{ background: 'var(--accent-soft)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-3 text-[var(--primary)]">⚠️ Key Abnormalities</p>
                        <div className="space-y-2">
                          {allAbnormal.slice(0, 6).map(b => (
                            <div key={b._id} className="flex items-center justify-between">
                              <span className="text-xs font-semibold capitalize" style={{ color: CLR.dark }}>{b.biomarkerName}</span>
                              <span className="text-xs font-bold font-mono" style={{ color: b.severity === 'Critical' ? '#C53030' : 'var(--primary)' }}>{b.value} {b.unit}</span>
                            </div>
                          ))}
                          {allAbnormal.length > 6 && <p className="text-[10px] text-center" style={{ color: CLR.muted }}>+{allAbnormal.length - 6} more</p>}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-3xl p-4 text-center" style={{ background: 'var(--accent)', border: '1px solid #FDE68A' }}>
                        <p className="text-sm font-bold" style={{ color: 'var(--primary)' }}>✓ All values normal</p>
                        <p className="text-xs mt-1" style={{ color: '#B45309' }}>No abnormalities detected.</p>
                      </div>
                    )}

                    <Link href={`/dashboard/doctor/patient/${selectedPt?._id}/dashboard`}
                      className="flex items-center justify-center gap-2 w-full text-xs font-black py-3 rounded-2xl transition-all active:scale-95 uppercase tracking-widest shadow-md"
                      style={{ background: CLR.primary, color: '#fff' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                      Full Trend Analytics
                    </Link>
                  </>
                )}
            </div>
        </div>
      </div>

      {/* ────── FLOATING BUTTONS ────── */}
      <div className="fixed bottom-[90px] right-6 z-50 flex flex-col gap-3">
        {selectedReport && (
            <VoiceSummaryButton 
                text={selectedReport.ai?.summary || "Report summarized."}
                reportId={selectedReport._id}
                isIcon={true}
            />
        )}
      </div>

      {selectedPt && dashData && (
        <DoctorPatientChat
          patientId={selectedPt._id}
          patientName={selectedPt.name}
          reportCount={dashData.reports?.length ?? 0}
        />
      )}
    </div>
  );
}
