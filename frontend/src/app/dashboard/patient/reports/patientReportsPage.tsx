'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import PatientReportCard from '@/components/patient/PatientReportCard';

export default function PatientReportsPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await axios.get(`${apiUrl}/api/patient/reports/my-reports`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReports(res.data);
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };

        if (user?.id) fetchReports();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-[#1F2933]">{t('reports')}</h1>
                <p className="text-[#6B7280] mt-1 text-lg font-medium tracking-tight">
                    {t('reports_subtitle') || 'View and manage all your clinical laboratory results.'}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reports.map(report => (
                    <PatientReportCard key={report._id} report={report} />
                ))}
                {reports.length === 0 && (
                    <div className="bg-white p-20 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
                        <svg className="mx-auto h-12 w-12 text-[#E2E8F0] mb-4" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            <path d="M14.5 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5L14.5 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="14 3 14 9 20 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="text-[#6B7280] font-bold">No clinic reports available in your account.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
