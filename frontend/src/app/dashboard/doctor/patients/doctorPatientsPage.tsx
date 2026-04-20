'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { patientService } from '@/services/patientService';
import { Patient } from '@/types';
import api from '@/services/api';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState<string | null>(null);

  useEffect(() => {
    patientService.getDoctorPatients()
      .then(data => {
        const list = data || [];
        setPatients(list);
        if (list.length > 0) openPatient(list[0]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openPatient = async (p: Patient) => {
    setSelected(p);
    setPatientReports([]);
    setReportsLoading(true);
    try {
      const res = await api.get(`/doctor/patient/${p._id}/reports`);
      setPatientReports(res.data || []);
    } catch {
      setPatientReports([]);
    } finally {
      setReportsLoading(false);
    }
  };

  const saveNote = async (reportId: string) => {
    if (!noteText.trim()) return;
    setSavingNote(reportId);
    try {
      await api.post(`/doctor/reports/${reportId}/note`, { note: noteText });
      setNoteText('');
      if (selected) openPatient(selected);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNote(null);
    }
  };

  const lastVisitLabel = (idx: number) => {
    const labels = ['2h ago', 'Yesterday', '3 days ago', 'Oct 12', 'Last week', '2 weeks ago'];
    return labels[idx % labels.length];
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="-m-8 bg-[#F1F5F5] min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 70px)' }}>

        {/* ── Left Panel: Patient List ── */}
        <div className="w-[260px] shrink-0 bg-[#F1F5F5] border-r border-[#E2E8F0] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-6 pb-4">
            <h2 className="text-base font-extrabold text-[#2D3A3A]">Patients</h2>
            {!loading && (
              <span className="text-[11px] font-bold text-[#4F6F6F] bg-[#8FB9A8]/20 px-2.5 py-1 rounded-full">
                {patients.length} Active
              </span>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5">
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-4 border-[#FCEEA5] border-t-[#C8A84B] rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400 font-medium">No patients found.</p>
              </div>
            ) : filtered.map((p, idx) => {
              const isActive = selected?._id === p._id;
              return (
                <div
                  key={p._id}
                  onClick={() => openPatient(p)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openPatient(p)}
                  className={`w-full text-left px-4 py-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer outline-none ${
                    isActive
                      ? 'bg-white shadow-[0_2px_12_rgba(0,0,0,0.1)] border border-gray-100'
                      : 'hover:bg-white/60 border border-transparent'
                  }`}
                >
                  {/* ... (rest of the content remains the same) */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center font-bold text-gray-500 text-base shrink-0 overflow-hidden">
                    {p.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-[#2D3A3A] text-[14px] truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] bg-[#8FB9A8]/10 px-2 py-0.5 rounded-md">
                        {p.lvId || 'LV-99'}
                      </p>
                    </div>
                  </div>
                  {/* QUICK VOICE ACCESS */}
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    <VoiceSummaryButton 
                      patientId={p._id}
                      isIcon={true}
                      label="Analysis"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Center Panel ── */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {!selected ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <div className="w-16 h-16 bg-[#8FB9A8]/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="font-semibold text-[#5C7C7C] text-sm">Select a patient to view their records</p>
            </div>
          ) : (
            <>
              {/* Patient Info Card */}
              <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-gray-100 p-6">
                <div className="flex items-center gap-5">
                  {/* Photo placeholder */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-3xl font-bold text-gray-400 shrink-0 overflow-hidden">
                    {selected.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-extrabold text-[#2D3A3A] tracking-tight truncate">{selected.name}</h2>
                      <button className="w-7 h-7 flex items-center justify-center text-[#4F6F6F] bg-[#8FB9A8]/10 rounded-lg hover:bg-[#8FB9A8]/20 transition-all shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      <span className="text-[13px] font-bold text-[#4F6F6F]">ID: #{selected.lvId || 'PN-992-04'}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['72 Years', 'O+ Blood', 'Stage II Hypertension'].map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-[#8FB9A8]/10 text-[#4F6F6F] rounded-lg text-[11px] font-semibold border border-[#8FB9A8]/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Report History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-extrabold text-[#2D3A3A]">Clinical Report History</h3>
                  <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#4F6F6F] hover:text-black transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="8" x2="20" y1="12" y2="12"/><line x1="14" x2="20" y1="18" y2="18"/></svg>
                    Filter
                  </button>
                </div>

                {reportsLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#FCEEA5] border-t-[#C8A84B] rounded-full animate-spin" />
                  </div>
                ) : patientReports.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-12 text-center shadow-sm">
                    <p className="text-sm text-gray-400 font-medium">No clinical reports found for this patient.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline vertical line */}
                    <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-gray-200" />

                    <div className="space-y-4">
                      {patientReports.map((report: any, i: number) => (
                        <div key={report._id} className="flex gap-5 relative">
                          {/* Dot */}
                          <div className={`w-5 h-5 rounded-full shrink-0 mt-5 z-10 border-2 border-white shadow-sm ${
                            i === 0 ? 'bg-[#4F6F6F]' : 'bg-gray-300'
                          }`} />

                          {/* Card */}
                          <div className="flex-1 bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] border border-gray-100 px-5 py-4 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#2D3A3A] text-[14px] leading-snug mb-1">
                                  {report.reportName || report.testType}
                                </h4>
                                <p className="text-[12px] text-[#5C7C7C] leading-relaxed mb-3 line-clamp-3">
                                  {report.aiSummary
                                    ?.replace(/<\/?[^>]+(>|$)/g, '')
                                    ?.replace(/\*\*/g, '')
                                    ?.slice(0, 160) || 'Routine diagnostic screening. Full clinical evaluation pending.'}
                                </p>
                                {/* File chips */}
                                <div className="flex flex-wrap gap-2">
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8FB9A8]/10 hover:bg-[#8FB9A8]/20 text-[#4F6F6F] rounded-lg text-[11px] font-semibold transition-all"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                    {report.testType || 'Report'}.pdf
                                  </a>
                                  {report.reportName && (
                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8FB9A8]/10 text-[#4F6F6F] rounded-lg text-[11px] font-semibold">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                      Echo_Scan.jpg
                                    </span>
                                  )}
                                </div>

                                {/* Clinical note input */}
                                {report.doctorComment && (
                                  <div className="mt-3 px-3 py-2 bg-[#8FB9A8]/10 rounded-xl border border-[#8FB9A8]/20">
                                    <p className="text-[10px] font-bold text-[#4F6F6F] uppercase tracking-widest mb-0.5">Clinical Note</p>
                                    <p className="text-[12px] text-gray-700 italic">"{report.doctorComment}"</p>
                                  </div>
                                )}
                                <div className="flex gap-2 mt-3">
                                  <input
                                    type="text"
                                    placeholder="Add note…"
                                    value={savingNote === report._id ? '' : noteText}
                                    onChange={e => setNoteText(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && saveNote(report._id)}
                                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] outline-none focus:border-[#4F6F6F]/30 focus:ring-2 focus:ring-[#8FB9A8]/10 transition-all"
                                  />
                                  <button
                                    onClick={() => saveNote(report._id)}
                                    disabled={savingNote === report._id}
                                    className="px-4 py-2 bg-[#4F6F6F] hover:bg-[#2D3A3A] text-white text-[12px] font-semibold rounded-xl transition-all disabled:opacity-50"
                                  >
                                    {savingNote === report._id ? '…' : 'Save'}
                                  </button>
                                </div>
                              </div>
                              {/* Date */}
                              <div className="shrink-0 text-right">
                                <p className="text-[11px] font-semibold text-[#7A9999] uppercase tracking-wide whitespace-nowrap">
                                  {new Date(report.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Right Panel ── */}
        {selected && (
          <div className="w-[260px] shrink-0 overflow-y-auto px-4 py-6 space-y-4 border-l border-[#E2E8F0] bg-[#F1F5F5]">

            {/* Predictive Analysis Card */}
            <div className="bg-[#F5C842] rounded-2xl p-5 relative overflow-hidden shadow-[0_4px_20px_rgba(245,200,66,0.3)]">
              <div className="relative z-10">
                <h3 className="text-[15px] font-extrabold text-[#1a1000] leading-snug mb-2">
                  Predictive Analysis Available
                </h3>
                <p className="text-[12px] text-[#3d2c00]/70 leading-relaxed mb-4">
                  New diagnostic insights generated from recent lab results.
                </p>
                <Link
                  href={`/dashboard/doctor/patient/${selected._id}/dashboard`}
                  className="w-full bg-[#1a1000] text-white text-[11px] font-bold uppercase tracking-widest py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2d1e00] transition-all shadow-md"
                >
                  View Intelligence Dashboard
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
