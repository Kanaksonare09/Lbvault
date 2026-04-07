'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { patientService } from '@/services/patientService';
import { Patient } from '@/types';
import api from '@/services/api';

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
      .then(data => setPatients(data || []))
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

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Assigned Patients</h1>
          <p className="text-[#6B7280] mt-1 font-medium">Access patient reports and add clinical feedback.</p>
        </div>
        <div className="bg-[#4F6F6F]/10 px-4 py-2 rounded-2xl">
          <span className="text-xs font-black text-[#4F6F6F] uppercase tracking-widest">{patients.length} Patients</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-[#E2E8F0] rounded-2xl font-medium text-sm text-[#1F2933] outline-none focus:border-[#4F6F6F] focus:ring-4 focus:ring-[#4F6F6F]/10 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
              <p className="text-[#6B7280] font-bold">{search ? 'No matching patients' : 'No patients assigned yet.'}</p>
            </div>
          ) : filtered.map(p => (
            <button
              key={p._id}
              onClick={() => openPatient(p)}
              className={`w-full text-left p-5 rounded-3xl border transition-all group ${selected?._id === p._id
                ? 'bg-[#4F6F6F] border-[#4F6F6F] text-white shadow-lg'
                : 'bg-white border-[#E2E8F0] hover:border-[#4F6F6F]/30 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0 ${selected?._id === p._id ? 'bg-white/20 text-white' : 'bg-[#8FB9A8]/20 text-[#4F6F6F]'}`}>
                  {p.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black truncate ${selected?._id === p._id ? 'text-white' : 'text-[#1F2933]'}`}>{p.name}</p>
                  <p className={`text-xs truncate ${selected?._id === p._id ? 'text-white/70' : 'text-[#6B7280]'}`}>{p.email}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={selected?._id === p._id ? 'text-white' : 'text-[#6B7280] group-hover:text-[#4F6F6F]'}><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </button>
          ))}
        </div>

        {/* Patient Reports Panel */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-3xl border border-dashed border-[#E2E8F0] p-20 text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-[#F6F7F5] rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8FB9A8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <p className="font-black text-[#1F2933]">Select a patient</p>
              <p className="text-sm text-[#6B7280] font-medium">Click a patient on the left to view their reports and add clinical notes.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Patient Header */}
              <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm flex items-center gap-4">
                <div className="w-14 h-14 bg-[#8FB9A8]/20 rounded-full flex items-center justify-center font-black text-xl text-[#4F6F6F] shrink-0">
                  {selected.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#1F2933]">{selected.name}</h2>
                  <p className="text-sm text-[#6B7280] font-medium">{selected.email}</p>
                </div>
              </div>

              {/* Reports */}
              {reportsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-10 h-10 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
                </div>
              ) : patientReports.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-[#E2E8F0] p-12 text-center">
                  <p className="font-bold text-[#6B7280]">No shared reports from this patient.</p>
                </div>
              ) : patientReports.map((report: any) => (
                <div key={report._id} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-[#F6F7F5] flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#F6F7F5] rounded-2xl flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <h3 className="font-black text-[#1F2933]">{report.reportName}</h3>
                        <p className="text-xs text-[#6B7280] mt-0.5">{report.testType} · {new Date(report.uploadDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs font-black text-[#4F6F6F] bg-[#F6F7F5] px-3 py-2 rounded-xl hover:bg-[#E2E8F0] transition-colors shrink-0"
                    >
                      View File
                    </a>
                  </div>

                  {/* AI Summary */}
                  {report.aiSummary && (
                    <div className="px-6 py-4 bg-[#F8FAF9] border-b border-[#F6F7F5]">
                      <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest mb-2">AI Summary</p>
                      <div 
                          className="text-sm text-[#1F2933] font-medium leading-relaxed line-clamp-3 whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: report.aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                      />
                    </div>
                  )}

                  {/* Biomarkers */}
                  {report.extractedData && Object.keys(report.extractedData).length > 0 && (
                    <div className="px-6 py-4 border-b border-[#F6F7F5]">
                      <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest mb-3">Biomarkers</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(report.extractedData).map(([key, val]: [string, any]) => (
                          <span key={key} className="text-xs font-bold bg-[#F6F7F5] text-[#1F2933] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
                            {key}: <span className="text-[#4F6F6F]">{val}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Doctor Note */}
                  <div className="p-6">
                    {report.doctorComment && (
                      <div className="mb-4 p-4 bg-[#4F6F6F]/5 rounded-2xl border border-[#4F6F6F]/10">
                        <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest mb-2">Your Clinical Note</p>
                        <p className="text-sm font-medium text-[#1F2933] italic">"{report.doctorComment}"</p>
                      </div>
                    )}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add clinical note / feedback..."
                        value={savingNote === report._id ? '' : noteText}
                        onChange={e => setNoteText(e.target.value)}
                        className="flex-1 px-4 py-3 bg-[#F6F7F5] border border-transparent rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-[#4F6F6F]/30 transition-all"
                      />
                      <button
                        onClick={() => saveNote(report._id)}
                        disabled={savingNote === report._id}
                        className="px-5 py-3 bg-[#4F6F6F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1F2933] transition-all disabled:opacity-50 shadow-md"
                      >
                        {savingNote === report._id ? '…' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
