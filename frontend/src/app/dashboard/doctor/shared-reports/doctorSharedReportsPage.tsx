'use client';

import { useState, useEffect } from 'react';
import api from '@/services/api';
import AudioPlayer from '@/components/ui/AudioPlayer';

const STATUS_MAP: Record<string, { bg: string; text: string; dot: string }> = {
  High: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  Low: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Normal: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
};

export default function DoctorSharedReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [audioOpen, setAudioOpen] = useState<string | null>(null);

  useEffect(() => {
    api.get('/doctor/shared-reports')
      .then(res => setReports(res.data || []))
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

  const filtered = reports.filter(r =>
    (r.reportName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (typeof r.patientId === 'object' ? r.patientId?.name : '').toLowerCase().includes(search.toLowerCase()) ||
    (r.testType ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">Shared Lab Reports</h1>
          <p className="text-[#6B7280] mt-1 font-medium">Review patient-shared reports, add clinical notes, and listen to AI summaries.</p>
        </div>
        <div className="bg-[#4F6F6F]/10 px-4 py-2 rounded-2xl">
          <span className="text-xs font-black text-[#4F6F6F] uppercase tracking-widest">{reports.length} Reports</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input
          type="text"
          placeholder="Search by patient, report name or test type..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-4 bg-white border border-[#E2E8F0] rounded-2xl font-medium text-sm text-[#1F2933] outline-none focus:border-[#4F6F6F] focus:ring-4 focus:ring-[#4F6F6F]/10 transition-all shadow-sm"
        />
      </div>

      {/* Reports */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-[#E2E8F0] py-24 text-center">
          <p className="font-black text-[#1F2933]">{search ? 'No matching reports' : 'No shared reports yet'}</p>
          <p className="text-sm text-[#6B7280] font-medium mt-1">Reports shared by patients will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(report => {
            const patientName = typeof report.patientId === 'object' ? report.patientId?.name : 'Patient';
            const isExpanded = expanded === report._id;

            return (
              <div key={report._id} className="bg-white rounded-3xl border border-[#E2E8F0] shadow-sm overflow-hidden transition-all duration-300">
                {/* Card Header */}
                <div
                  className="p-6 flex items-start gap-4 cursor-pointer hover:bg-[#F6F7F5] transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : report._id)}
                >
                  <div className="w-12 h-12 bg-[#F6F7F5] rounded-2xl flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-black text-[#1F2933]">{report.reportName}</h3>
                      {report.doctorComment ? (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-100">Reviewed</span>
                      ) : (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-100">Pending</span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280] font-medium">
                      {patientName} · {report.testType} · {new Date(report.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-[#F6F7F5] animate-in slide-in-from-top-2 duration-300">
                    {/* AI Summary */}
                    {report.aiSummary && (
                      <div className="p-6 bg-[#F8FAF9] border-b border-[#F6F7F5]">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 bg-[#8FB9A8] rounded-full animate-pulse" />
                          <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest">AI Analysis Summary</p>
                        </div>
                        <div 
                            className="text-sm font-medium text-[#1F2933] leading-relaxed whitespace-pre-line"
                            dangerouslySetInnerHTML={{ __html: report.aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                        />
                      </div>
                    )}

                    {/* Biomarkers */}
                    {report.extractedData && Object.keys(report.extractedData).length > 0 && (
                      <div className="p-6 border-b border-[#F6F7F5]">
                        <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest mb-4">Biomarker Results</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(report.extractedData).map(([key, val]: [string, any]) => (
                            <div key={key} className="bg-[#F6F7F5] rounded-2xl p-3 border border-[#E2E8F0]">
                              <p className="text-xs text-[#6B7280] font-bold uppercase tracking-wide">{key}</p>
                              <p className="text-lg font-black text-[#1F2933] mt-0.5">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Audio Player */}
                    {report.aiSummary && (
                      <div className="p-6 border-b border-[#F6F7F5]">
                        <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest mb-3">Voice Summary</p>
                        <AudioPlayer reportId={report._id} reportName={report.reportName} compact />
                      </div>
                    )}

                    {/* File Link */}
                    <div className="px-6 py-4 border-b border-[#F6F7F5] flex items-center gap-3">
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-black text-[#4F6F6F] bg-[#F6F7F5] px-4 py-2 rounded-xl hover:bg-[#E2E8F0] transition-colors border border-[#E2E8F0]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        View PDF / Report
                      </a>
                    </div>

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
                          placeholder={report.doctorComment ? 'Update clinical note…' : 'Add clinical note or feedback…'}
                          value={savingNote === report._id ? '' : noteText}
                          onChange={e => setNoteText(e.target.value)}
                          className="flex-1 px-4 py-3 bg-[#F6F7F5] rounded-2xl text-sm font-medium outline-none focus:bg-white border border-transparent focus:border-[#4F6F6F]/30 transition-all"
                          onKeyDown={e => e.key === 'Enter' && saveNote(report._id)}
                        />
                        <button
                          onClick={() => saveNote(report._id)}
                          disabled={savingNote === report._id}
                          className="px-5 py-3 bg-[#4F6F6F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1F2933] transition-all disabled:opacity-50 shadow-md"
                        >
                          {savingNote === report._id ? '…' : 'Save Note'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
