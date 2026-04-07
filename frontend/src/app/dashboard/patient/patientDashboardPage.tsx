'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import PatientReportCard from '@/components/patient/PatientReportCard';
import { reportService } from '@/services/reportService';
import { Report } from '@/types';
import Link from 'next/link';
import AccessManagement from '@/components/patient/features/AccessManagement';
import UploadModal from '@/components/ui/UploadModal';


export default function PatientDashboardPage() {
    const { t } = useLanguage();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await reportService.getPatientReports();
                console.log('Fetched Reports:', data);
                setReports(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to fetch reports', err);
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) {
            if (user?.id || user?._id) {
                fetchReports();
            } else {
                setLoading(false);
            }
        }
    }, [user, authLoading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
            </div>
        );
    }

    const reportsList = Array.isArray(reports) ? reports : [];
    const latestReport = reportsList.length > 0 ? reportsList[0] : null;
    const insightsReport = reportsList.find(r => 
        (r.aiSummary && r.aiSummary.length > 0) || 
        (r.extractedData && Object.keys(r.extractedData).length > 0)
    );

    return (
        <div className="space-y-8 pb-12">
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={() => {
                        setShowUpload(false);
                        reportService.getPatientReports().then(d => setReports(Array.isArray(d) ? d : []));
                    }}
                />
            )}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#1F2933] tracking-tight">{t('dashboard')}</h1>
                    <p className="text-[#6B7280] mt-1 text-lg font-medium tracking-tight">Your health overview at a glance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 bg-[#4F6F6F] text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1F2933] transition-all shadow-md active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload Report
                    </button>
                    <div className="bg-[#8FB9A8]/10 px-4 py-2 rounded-2xl border border-[#8FB9A8]/20">
                        <p className="text-xs font-bold text-[#4F6F6F] uppercase tracking-widest">{t('profileStatus')}</p>
                        <p className="text-sm font-black text-[#1F2933]">{t('verifiedPatient')}</p>
                    </div>
                </div>
            </div>

            {/* Quick Health Insight - Moved to Top */}
            {insightsReport && (
                <div className="bg-gradient-to-br from-[#8FB9A8]/20 to-[#4F6F6F]/5 border border-[#8FB9A8]/30 p-8 rounded-[40px] flex flex-col md:flex-row items-center gap-8 shadow-sm">
                    <div className="relative">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-md border border-[#8FB9A8]/20 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#4F6F6F] rounded-full flex items-center justify-center border-4 border-white">
                            <span className="text-white text-[10px] font-black">AI</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-[#4F6F6F] text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Dynamic Summary</span>
                            <h3 className="text-xl font-black text-[#1F2933]">{t('quickHealthInsight')}</h3>
                        </div>
                        <p className="text-[#4F6F6F] font-bold mt-1 max-w-3xl leading-relaxed text-lg italic">
                            "{insightsReport.aiSummary ? (
                                insightsReport.aiSummary.length > 200 
                                    ? `${insightsReport.aiSummary.substring(0, 200)}...` 
                                    : insightsReport.aiSummary
                            ) : (
                                `${t('healthSummary')} for ${insightsReport.reportName}. ${Object.entries(insightsReport.extractedData || {}).slice(0, 2).map(([k, v]) => `${t(k.toLowerCase())} is ${v}`).join('. ')}`
                            )}"
                        </p>
                        <div className="flex gap-4 mt-6">
                            <button
                                onClick={() => router.replace('/dashboard/patient/insights')}
                                className="bg-[#4F6F6F] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1F2933] transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                            >
                                {t('viewDetailedAnalysis')}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* LV-ID Card */}
                <div className="bg-gradient-to-br from-[#1F2933] to-[#4F6F6F] p-6 rounded-3xl shadow-lg text-white">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <h3 className="text-[#8FB9A8] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Your LV-ID</h3>
                    <p className="text-sm font-black tracking-widest font-mono text-white/90 break-all">
                        {(user?.id || user?._id || 'N/A').toString().slice(0, 16)}…
                    </p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-[#F6F7F5] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#8FB9A8]/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </div>
                    <h3 className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t('totalReports')}</h3>
                    <p className="text-3xl font-black text-[#1F2933]">{reports.length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E2E8F0] hover:shadow-md transition-shadow group">
                    <div className="w-12 h-12 bg-[#F6F7F5] rounded-2xl flex items-center justify-center mb-4 group-hover:bg-[#8FB9A8]/10 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <h3 className="text-[#6B7280] text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t('sharedWithDoctors')}</h3>
                    <p className="text-3xl font-black text-[#1F2933]">0</p>
                </div>

                <div className="bg-[#4F6F6F] p-6 rounded-3xl shadow-lg border border-[#4F6F6F] text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                        </div>
                        <span className="text-[10px] font-black bg-[#8FB9A8] text-[#1F2933] px-2 py-1 rounded-lg uppercase">{t('latest')}</span>
                    </div>
                    <h3 className="text-[#8FB9A8] text-[10px] font-black uppercase tracking-[0.2em] mb-1">{t('recentUploads')}</h3>
                    <p className="text-md font-bold leading-tight line-clamp-1">{latestReport ? latestReport.reportName : '---'}</p>
                    <p className="text-[#8FB9A8] text-[10px] font-black mt-2 uppercase">
                        {latestReport?.uploadDate ? new Date(latestReport.uploadDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                    </p>
                </div>
            </div>


            {/* Recent Reports List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-[#1F2933]">{t('recentUploads')}</h2>
                    <Link href="/dashboard/patient/reports" className="text-sm font-bold text-[#4F6F6F] hover:underline flex items-center space-x-1">
                        <span>{t('viewAllHistory')}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                    </Link>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {reportsList.length > 0 ? (
                        reportsList.slice(0, 3).map(report => (
                            <PatientReportCard key={report._id} report={report} />
                        ))
                    ) : (
                        <div className="bg-white p-20 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
                            <p className="text-[#6B7280] font-bold">{t('noReports')} (Currently 0 active reports found)</p>
                            <p className="text-xs text-[#94A3B8] mt-2 italic">Newly uploaded reports will appear here with AI insights and voice summaries.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Access Management Section */}
            <div className="mt-12">
                <AccessManagement />
            </div>
        </div>
    );
}

