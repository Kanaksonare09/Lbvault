'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doctorService } from '@/services/doctorService';
import AISummaryCard from '@/components/doctor/dashboard/AISummaryCard';
import OCRTable from '@/components/doctor/dashboard/OCRTable';
import AbnormalityList from '@/components/doctor/dashboard/AbnormalityList';
import TrendChart from '@/components/doctor/dashboard/TrendChart';

export default function PatientIntelligenceDashboard() {
  const { id: patientId } = useParams() as { id: string };
  
  const [data, setData] = useState<any>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await doctorService.getPatientDashboard(patientId);
        setData(result);
        if (result.reports?.length > 0) {
          setSelectedReportId(result.reports[0]._id);
        }
      } catch (err: any) {
        console.error('Dashboard Fetch Error:', err);
        setError(err.response?.data?.message || 'Failed to aggregate clinical intelligence.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [patientId]);

  const selectedReport = data?.reports?.find((r: any) => r._id === selectedReportId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-8 space-y-12">
        <div className="max-w-[1600px] mx-auto space-y-10">
          <div className="flex justify-between items-end">
             <div className="space-y-4">
                <div className="h-10 w-64 bg-gray-200 rounded-2xl animate-pulse" />
                <div className="h-6 w-96 bg-gray-200 rounded-xl animate-pulse" />
             </div>
             <div className="h-16 w-32 bg-gray-200 rounded-3xl animate-pulse" />
          </div>
          <div className="grid grid-cols-12 gap-8">
             <div className="col-span-3 space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-[30px] animate-pulse" />)}
             </div>
             <div className="col-span-9 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                   <div className="h-64 bg-gray-200 rounded-[40px] animate-pulse" />
                   <div className="h-64 bg-gray-200 rounded-[40px] animate-pulse" />
                </div>
                <div className="h-96 bg-gray-200 rounded-[40px] animate-pulse" />
             </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-10 gap-6 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100">
           <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="text-2xl font-black text-[var(--foreground)]">System Error</h2>
        <p className="text-[var(--muted-foreground)] font-medium max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[var(--primary)] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-[var(--foreground)] transition-all"
        >
          Re-Initialize Intelligence
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24 animate-in fade-in duration-700">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        
        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-[var(--foreground)] tracking-tight leading-none">
              {data.patient.name} <span className="text-[var(--secondary)] text-3xl ml-2 font-black">Dash</span>
            </h1>
            <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest text-[var(--primary)]">
               <span>LV-ID: {data.patient.lvId}</span>
               <span className="w-1 h-1 bg-gray-300 rounded-full" />
               <span>{data.reports.length} Clinical Interventions</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="px-6 py-4 bg-white rounded-3xl border border-[var(--border)] shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                <p className="font-black text-[var(--foreground)]">Active Observation</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Side View: History Tracker */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-black text-[var(--primary)] uppercase tracking-[0.2em]">Medical History</h3>
               <span className="text-[10px] font-bold text-gray-400">Sort by Date</span>
            </div>
            <div className="space-y-4 max-h-[900px] overflow-y-auto pr-2 custom-scrollbar">
              {data.reports.map((report: any) => (
                <button
                  key={report._id}
                  onClick={() => setSelectedReportId(report._id)}
                  className={`w-full text-left p-6 rounded-[35px] border transition-all duration-300 group ${
                    selectedReportId === report._id
                      ? 'bg-[var(--foreground)] border-[var(--foreground)] text-white shadow-2xl translate-x-3 scale-[1.02]'
                      : 'bg-white border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-xl hover:translate-x-1'
                  }`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          selectedReportId === report._id ? 'bg-white/10 text-white' : 'bg-[var(--background)] text-[var(--primary)]'
                       }`}>
                          {report.testType}
                       </span>
                       {report.abnormalities?.length > 0 && (
                          <span className="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_10px_#f43f5e]" />
                       )}
                    </div>
                    <p className="font-black text-sm truncate uppercase tracking-tight">{report.reportName}</p>
                    <div className={`flex items-center gap-2 text-[10px] font-bold ${
                       selectedReportId === report._id ? 'text-white/60' : 'text-[var(--muted-foreground)]'
                    }`}>
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                       {new Date(report.reportDate || report.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Core Dashboard: Dynamic Grid */}
          <div className="lg:col-span-9 space-y-10">
            {selectedReport ? (
              <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  {/* Modular AI Observation */}
                  <AISummaryCard 
                    summary={selectedReport.ai?.summary} 
                    confidence={0.92} 
                  />

                  {/* Modular Abnormality List */}
                  <div className="bg-white rounded-[40px] p-8 border border-[var(--border)] shadow-sm">
                     <AbnormalityList abnormalities={selectedReport.abnormalities} />
                  </div>
                </div>

                {/* Structured Intelligence Layer */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                   {/* Modular OCR Table */}
                   <OCRTable 
                      data={selectedReport.ocr || selectedReport.extractedData || {}} 
                      title="Point-of-Care Data"
                   />

                   {/* Original Document View */}
                   <div className="bg-[var(--foreground)] rounded-[40px] p-2 border border-[#323F4B] shadow-2xl relative group overflow-hidden aspect-video">
                      <iframe 
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedReport.fileUrl}#toolbar=0&navpanes=0`}
                        className="w-full h-full rounded-[35px] border-none"
                      />
                      <div className="absolute inset-0 bg-[var(--foreground)]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                         <div className="px-8 py-4 bg-white text-[var(--foreground)] rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                            Confirm Original Record
                         </div>
                      </div>
                   </div>
                </div>

                {/* Modular Trends: Fully Dynamic Chart Gen */}
                {data.trends?.length > 0 && (
                  <div className="bg-white rounded-[40px] p-10 border border-[var(--border)] shadow-sm space-y-12">
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                           <h3 className="text-sm font-black text-[var(--primary)] uppercase tracking-[0.2em]">Longitudinal Analysis</h3>
                           <p className="text-xs font-semibold text-gray-400">Detecting progression patterns for all significant biomarkers.</p>
                        </div>
                        <div className="flex gap-4">
                           <span className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <span className="w-2 h-2 rounded-full bg-[var(--secondary)]" /> Baseline
                           </span>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {data.trends.slice(0, 4).map((trend: any) => (
                          <TrendChart 
                            key={trend.parameter} 
                            parameter={trend.parameter} 
                            data={trend.values} 
                          />
                        ))}
                     </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border border-dashed border-[var(--border)] p-40 text-center flex flex-col items-center gap-8 shadow-sm">
                <div className="w-24 h-24 bg-[var(--background)] rounded-full flex items-center justify-center animate-bounce">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tighter">Awaiting Signal</h3>
                  <p className="text-[var(--muted-foreground)] font-medium max-w-sm mx-auto">Please select a record from the history tracker to initialize the dynamic clinical intelligence layer.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E0;
        }
      `}</style>
    </div>
  );
}
