'use client';

import React, { useState, useEffect } from 'react';
import { reportService } from '@/services/reportService';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import VoiceSummaryButton from '@/components/patient/VoiceSummaryButton';
import AskAIPanel from '@/components/patient/AskAIPanel';

export default function PatientHealthInsightsPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    
    // Core state
    const [reports, setReports] = useState<any[]>([]);
    const [activeReportId, setActiveReportId] = useState<string | null>(null);
    const [activeReportDetails, setActiveReportDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [showAskAI, setShowAskAI] = useState(false);

    // Fetch master list of reports
    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await reportService.getPatientReports();
                const insightsReports = Array.isArray(data) ? data : [];
                setReports(insightsReports);
                if (insightsReports.length > 0) {
                    setActiveReportId(insightsReports[0]._id);
                }
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading && user) {
            fetchReports();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    // Fetch details when active report changes
    useEffect(() => {
        if (!activeReportId) return;
        const fetchDetails = async () => {
            setDetailLoading(true);
            try {
                const details = await reportService.getReportById(activeReportId);
                setActiveReportDetails(details);
            } catch (err) {
                console.error('Failed to fetch report details', err);
            } finally {
                setDetailLoading(false);
            }
        };
        fetchDetails();
    }, [activeReportId]);

    // Parser for AI text
    const parseSummary = (text: string) => {
        if (!text) return { intro: '', recommendations: [] };
        // Clean out markdown noise
        let cleanText = text.replace(/###/g, '').replace(/\*\*/g, '');
        
        let intro = cleanText;
        let recommendations: string[] = [];

        // Try to split on common headers that signify actions/recommendations
        const splitKeywords = ['Recommendation:', 'Recommendations:', 'Actionable Steps:', 'Next Steps:', '---'];
        let splitIndex = -1;
        
        for (const kw of splitKeywords) {
            const idx = cleanText.indexOf(kw);
            if (idx !== -1) {
                splitIndex = idx;
                break;
            }
        }

        if (splitIndex !== -1) {
            intro = cleanText.substring(0, splitIndex).trim();
            const recRaw = cleanText.substring(splitIndex).replace(/^(Recommendation[s]?[:]*|Actionable Steps[:]*|Next Steps[:]*|---)/i, '').trim();
            recommendations = recRaw.split(/[•\n-]/).map(r => r.trim()).filter(r => r.length > 5);
        } else {
            // Give a soft fallback if no keywords found
            recommendations = ["Consider sharing these results with your doctor.", "Maintain a balanced diet and stay hydrated."];
        }

        return { intro, recommendations };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="bg-white p-24 rounded-[3rem] border-2 border-dashed border-[#E2E8F0] text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-[#F6F7F5] rounded-full flex items-center justify-center text-[#94A3B8]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </div>
                <div className="max-w-md">
                    <p className="text-2xl font-black text-[#1F2933]">No Health Insights Yet</p>
                    <p className="text-[#6B7280] font-medium mt-2 leading-relaxed">Once your lab reports are uploaded and processed by our system, your health insights and breakdowns will appear directly here.</p>
                </div>
            </div>
        );
    }

    const report = activeReportDetails;
    const { intro, recommendations } = report ? parseSummary(report.aiSummary) : { intro: '', recommendations: [] };
    const rawBiomarkers = report?.biomarkers || [];
    
    // Group logic
    const flaggedMarkers = rawBiomarkers.filter((b: any) => b.isAbnormal);

    // Range bar components logic
    const calculatePosition = (val: number, min: number, max: number) => {
        if (isNaN(min) || isNaN(max) || isNaN(val)) return 50; // default to center if data is missing
        const range = max - min;
        if (range === 0) return 50;
        const boundedVal = Math.max(min - (range*0.2), Math.min(max + (range*0.2), val));
        const totalRange = range * 1.4; // 20% pad on each side
        const percent = ((boundedVal - (min - (range*0.2))) / totalRange) * 100;
        return percent || 50;
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700 max-w-5xl mx-auto">
            
            {/* Header & Report Selector Pill Navbar */}
            <div className="space-y-6">
                <div>
                    <h1 className="text-4xl font-black text-[#1F2933] tracking-tight">{t('healthInsights')}</h1>
                    <p className="text-[#6B7280] mt-2 font-medium text-lg">Your lab results translated into plain language, simplified for you.</p>
                </div>

                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {reports.map((r: any) => (
                        <button
                            key={r._id}
                            onClick={() => setActiveReportId(r._id)}
                            className={`shrink-0 px-6 py-3 rounded-full text-sm font-bold transition-all border ${
                                activeReportId === r._id 
                                ? 'bg-[#4F6F6F] border-[#4F6F6F] text-white shadow-md' 
                                : 'bg-white border-[#E2E8F0] text-[#6B7280] hover:bg-[#F6F7F5]'
                            }`}
                        >
                            {r.testType || r.category || 'Report'} • {r.reportDate || r.createdAt ? new Date(r.reportDate || r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recent'}
                        </button>
                    ))}
                </div>
            </div>

            {detailLoading || !report ? (
                <div className="flex items-center justify-center h-64 bg-white/50 rounded-[3rem] border border-[#E2E8F0]">
                    <div className="w-10 h-10 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* 1. Summary Card */}
                    <div className="bg-white p-10 lg:p-12 rounded-[3rem] shadow-sm border border-[#E2E8F0] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8FB9A8]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8">
                            <div>
                                <div className="flex items-center space-x-3 text-[#8FB9A8] font-black uppercase tracking-widest text-xs mb-3">
                                    <svg className="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    <span>AI Analysis</span>
                                </div>
                                <h2 className="text-3xl font-black text-[#1F2933]">{report.reportName}</h2>
                            </div>
                            
                            <div className="flex flex-col items-end shrink-0 gap-3">
                                <VoiceSummaryButton 
                                    text={intro || `${report.reportName} processed.`}
                                    reportId={report._id}
                                />
                                <div className="flex bg-[#F6F7F5] rounded-full p-1 border border-[#E2E8F0] shadow-inner">
                                    {['EN'].map(l => (
                                        <button key={l} className="px-3 py-1 bg-white rounded-full text-[10px] font-black text-[#4F6F6F] shadow-sm tracking-wider">
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="relative z-10 prose prose-lg prose-[#1F2933]">
                            <p className="text-xl leading-relaxed font-medium text-[#4F6F6F]">
                                {intro ? intro : "Your report data has been mapped successfully. The AI observation model is currently optimizing for your language."}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 2. Biomarker Breakdown (Span 2) */}
                        <div className="lg:col-span-2 bg-white p-8 lg:p-10 rounded-[3rem] shadow-sm border border-[#E2E8F0]">
                            <h3 className="text-xl font-black text-[#1F2933] mb-8 flex items-center">
                                <svg className="mr-3 text-[#8FB9A8]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                                Detailed Breakdown
                            </h3>
                            
                            {rawBiomarkers.length > 0 ? (
                                <div className="space-y-8">
                                    {rawBiomarkers.map((b: any, idx: number) => {
                                        const pos = calculatePosition(Number(b.value), b.referenceMin, b.referenceMax);
                                        const isLow = Number(b.value) < b.referenceMin;
                                        const isHigh = Number(b.value) > b.referenceMax;
                                        const color = b.isAbnormal ? (isLow ? 'bg-amber-500' : 'bg-rose-500') : 'bg-emerald-500';
                                        const bgPulse = b.isAbnormal ? 'bg-rose-50' : 'hover:bg-[#F6F7F5]';

                                        return (
                                            <div key={idx} className={`p-4 rounded-2xl transition-colors ${bgPulse} cursor-pointer group`}>
                                                <div className="flex justify-between items-end mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-[#1F2933] text-lg capitalize">{b.biomarkerName}</h4>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-2xl font-black ${b.isAbnormal ? 'text-rose-600' : 'text-[#1F2933]'}`}>{b.value}</span>
                                                        <span className="text-[#6B7280] font-bold text-sm ml-1">{b.unit}</span>
                                                    </div>
                                                </div>

                                                <div className="relative h-6 w-full flex items-center">
                                                    {/* Background track */}
                                                    <div className="absolute w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                                                        {/* Green safe zone in middle (roughly 20% to 80% visually based on our 1.4x scaling) */}
                                                        <div className="absolute left-[14%] right-[14%] h-full bg-[#8FB9A8]/20"></div>
                                                    </div>
                                                    {/* Reference lines */}
                                                    <div className="absolute left-[14%] w-0.5 h-4 bg-[#8FB9A8] -translate-y-1"></div>
                                                    <div className="absolute right-[14%] w-0.5 h-4 bg-[#8FB9A8] -translate-y-1"></div>
                                                    
                                                    {/* Value Thumb */}
                                                    <div 
                                                        className={`absolute w-4 h-6 ${color} rounded-full shadow-md transform -translate-x-1/2 -translate-y-0.5 transition-all duration-1000 ease-out`}
                                                        style={{ left: `${pos}%` }}
                                                    ></div>
                                                </div>
                                                
                                                <div className="flex justify-between mt-2 text-[10px] uppercase font-black tracking-widest text-[#94A3B8]">
                                                    <span>{b.referenceMin}</span>
                                                    <span>{b.referenceMax}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-[#6B7280] italic">No structured markers detected.</p>
                            )}
                        </div>

                        {/* Right Column: Flags & Recommendations */}
                        <div className="space-y-8">
                            
                            {/* 3. Key Flags */}
                            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-[#E2E8F0]">
                                <h3 className="text-lg font-black text-[#1F2933] mb-6 flex items-center">
                                    <svg className="mr-3 text-rose-500" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                                    Key Observations
                                </h3>
                                
                                {flaggedMarkers.length === 0 ? (
                                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl border border-emerald-100 flex items-center">
                                        <svg className="mr-3 text-emerald-500 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                        <p className="font-bold text-sm">All extracted markers fall within normal reference ranges.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {flaggedMarkers.map((f: any, i: number) => {
                                            const isLow = Number(f.value) < f.referenceMin;
                                            return (
                                                <div key={i} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border flex items-center ${isLow ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                                                    {isLow ? (
                                                        <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
                                                    ) : (
                                                        <svg className="mr-1.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                                                    )}
                                                    {f.biomarkerName} {isLow ? 'Low' : 'Elevated'}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* 4. AI Recommendations */}
                            {recommendations.length > 0 && (
                                <div className="bg-[#F6F7F5] p-8 rounded-[3rem] border border-[#E2E8F0]">
                                    <h3 className="text-lg font-black text-[#4F6F6F] mb-6 flex items-center">
                                        <svg className="mr-3" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></svg>
                                        Care Suggestions
                                    </h3>
                                    <div className="space-y-3">
                                        {recommendations.map((rec, i) => (
                                            <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-[#E2E8F0] flex items-start">
                                                <div className="w-6 h-6 rounded-full bg-[#8FB9A8]/20 flex items-center justify-center text-[#4F6F6F] font-black text-[10px] shrink-0 mr-3 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm font-bold text-[#1F2933] leading-relaxed">{rec}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="sticky bottom-8 mt-12 bg-[#1F2933] p-4 rounded-full shadow-2xl flex items-center justify-between mx-auto max-w-fit px-6 gap-6 z-40 border border-[#4F6F6F]/50">
                        <button className="flex items-center text-white/80 hover:text-white text-sm font-black transition-colors px-2 py-2">
                            <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                            Share 
                        </button>
                        
                        <a 
                            href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                            download={`${report.reportName}.pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center text-white/80 hover:text-white text-sm font-black transition-colors px-2 py-2"
                        >
                            <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Save PDF
                        </a>

                        <button 
                            id="ask-ai-open-btn"
                            onClick={() => setShowAskAI(true)}
                            className="bg-[#8FB9A8] hover:bg-white text-[#1F2933] px-6 py-2.5 rounded-full text-sm font-black flex items-center transition-all shadow-lg shadow-[#8FB9A8]/20">
                            <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Ask AI
                        </button>
                    </div>

                    {/* Ask AI Chat Panel */}
                    {showAskAI && report && (
                        <AskAIPanel
                            reportId={report._id}
                            reportName={report.reportName}
                            onClose={() => setShowAskAI(false)}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
