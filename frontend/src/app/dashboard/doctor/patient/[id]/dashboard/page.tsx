'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doctorService } from '@/services/doctorService';
import AISummaryCard from '@/components/doctor/dashboard/AISummaryCard';
import OCRTable from '@/components/doctor/dashboard/OCRTable';
import AbnormalityList from '@/components/doctor/dashboard/AbnormalityList';
import TrendChart from '@/components/doctor/dashboard/TrendChart';
import SuggestionsBox from '@/components/doctor/dashboard/SuggestionsBox';
import ReportComparison from '@/components/doctor/dashboard/ReportComparison';

export default function PatientDashboard() {
  const { id: patientId } = useParams() as { id: string };
  
  const [data, setData] = useState<any>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await doctorService.getPatientDashboardData(patientId);
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
      <div className="min-h-screen bg-[#F6F7F5] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F6F7F5] flex flex-col items-center justify-center p-10 text-center gap-6">
        <h2 className="text-2xl font-black text-[#1F2933]">Execution Error</h2>
        <p className="text-[#6B7280] font-medium max-w-md">{error || 'Unable to load patient data.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F5] pb-24 animate-in fade-in duration-700">
      <div className="max-w-[1600px] mx-auto px-8 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-[#1F2933] tracking-tighter leading-none">
              {data.patient.name} <span className="text-[#8FB9A8] text-4xl block md:inline mt-2 md:mt-0 font-black">Intelligence</span>
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-[#4F6F6F]">
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-[#8FB9A8] rounded-full" />
                 ID: {data.patient.lvId}
               </div>
               <div className="flex items-center gap-2">
                 <span className="w-2 h-2 bg-[#8FB9A8] rounded-full" />
                 {data.reports.length} Reports Logged
               </div>
            </div>
          </div>
          
          <div className="flex gap-4">
             <div className="bg-white px-8 py-5 rounded-[30px] border border-[#E2E8F0] shadow-sm text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Health Status</p>
                <p className="text-lg font-black text-[#1F2933]">Stable Observation</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Timeline Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-[0.3em] px-2">Longitudinal Records</p>
            <div className="space-y-4 max-h-[1000px] overflow-y-auto pr-3 custom-scrollbar">
              {data.reports.map((report: any) => (
                <button
                  key={report._id}
                  onClick={() => setSelectedReportId(report._id)}
                  className={`w-full text-left p-7 rounded-[40px] border transition-all duration-500 group relative overflow-hidden ${
                    selectedReportId === report._id
                      ? 'bg-[#1F2933] border-[#1F2933] text-white shadow-2xl translate-x-3 scale-[1.03]'
                      : 'bg-white border-[#E2E8F0] hover:border-[#4F6F6F]/40 hover:shadow-xl'
                  }`}
                >
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                          selectedReportId === report._id ? 'bg-white/10' : 'bg-[#F6F7F5] text-[#4F6F6F]'
                       }`}>
                          {report.testType}
                       </span>
                       <span className="text-[9px] font-black opacity-50">{new Date(report.reportDate || report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="font-black text-sm uppercase tracking-tight line-clamp-2">{report.reportName}</p>
                    {report.abnormalities?.length > 0 && (
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${selectedReportId === report._id ? 'text-rose-300' : 'text-rose-600'}`}>
                            {report.abnormalities.length} Anomalies
                          </span>
                       </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Integrated Intelligence View */}
          <div className="lg:col-span-9 space-y-12">
            {selectedReport ? (
              <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-1000">
                
                {/* Insights Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  <AISummaryCard 
                    summary={selectedReport.ai?.summary} 
                    confidence={0.94}
                  />
                  <div className="space-y-8">
                     <AbnormalityList abnormalities={selectedReport.abnormalities} />
                     <SuggestionsBox suggestions={selectedReport.ai?.suggestions} />
                  </div>
                </div>

                {/* Analytical Layer */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                   <ReportComparison biomarkers={selectedReport.biomarkers} />
                   <OCRTable 
                      data={selectedReport.ai?.ocrText ? { "Extracted Text": selectedReport.ai.ocrText } : (selectedReport.extractedData || {})} 
                      title="Raw Intelligence Feed"
                   />
                </div>

                {/* Longitudinal Trends */}
                {data.trends?.length > 0 && (
                   <div className="bg-white rounded-[50px] p-12 border border-[#E2E8F0] shadow-sm space-y-16">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-[#F6F7F5]">
                         <div>
                            <h3 className="text-sm font-black text-[#4F6F6F] uppercase tracking-[0.3em] mb-3">Longitudinal Biomarker Analysis</h3>
                            <p className="text-xs font-bold text-gray-400">Comparing parameter stability across current and prior interventions.</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
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

                {/* Clinical Validation (File Viewer) */}
                <div className="bg-[#1F2933] rounded-[50px] p-2 border border-[#323F4B] shadow-2xl relative group overflow-hidden aspect-video">
                    <iframe 
                      src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedReport.fileUrl}#toolbar=0&navpanes=0`}
                      className="w-full h-full rounded-[45px] border-none"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-[#1F2933] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                       <a 
                         href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${selectedReport.fileUrl}`}
                         target="_blank"
                         className="inline-flex items-center gap-3 px-8 py-5 bg-white text-[#1F2933] rounded-[22px] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-[#F6F7F5] transition-colors"
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          Download Original Diagnostic Record
                       </a>
                    </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-[50px] border border-dashed border-[#E2E8F0] p-48 text-center flex flex-col items-center gap-10">
                <div className="w-28 h-28 bg-[#8FB9A8]/10 rounded-full flex items-center justify-center animate-pulse">
                   <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <div className="space-y-4">
                   <h3 className="text-4xl font-black text-[#1F2933] uppercase tracking-tighter">Initialize Intelligence</h3>
                   <p className="text-[#6B7280] font-medium max-w-sm mx-auto leading-relaxed">Select a diagnostic session from the history timeline to begin your data-driven medical review.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #CBD5E0;
        }
      `}</style>
    </div>
  );
}
