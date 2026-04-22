'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { reportService } from '@/services/reportService';
import { Report } from '@/types';

export default function ReportsPage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const data = await reportService.getAllReports();
                setReports(data);
            } catch (err) {
                console.error('Failed to fetch reports', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const filteredReports = reports.filter((report) => {
        const patientName = typeof report.patientId === 'object' ? report.patientId?.name : 'Unknown';
        const matchesSearch =
            report.reportName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patientName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || report.testType === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const exportReports = () => {
        const headers = ['Report Name', 'Patient', 'Test Type', 'Date'];
        const rows = filteredReports.map((r) => [
            `"${r.reportName}"`,
            `"${typeof r.patientId === 'object' ? r.patientId?.name : 'Unknown'}"`,
            `"${r.testType}"`,
            `"${new Date(r.uploadDate).toLocaleDateString()}"`,
        ]);
        const csv = [headers, ...rows].map((e) => e.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const CATEGORIES = ['All', 'Complete Blood Count (CBC)', 'Lipid Profile', 'Thyroid Function Test', 'Blood Glucose', 'Hematology Full Panel'];

    return (
        <div className="space-y-5">

            {/* ── Page Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-black text-gray-900"
                        style={{ fontSize: '1.55rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}
                    >
                        Report Archive
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-1 font-medium">
                        Search and manage the complete pathology report database.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={exportReports}
                        className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                        style={{
                            background: '#fff',
                            color: '#374151',
                            border: '1px solid #E8EDF2',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        }}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Export CSV
                    </button>
                    <Link
                        href="/dashboard/pathology/upload-report"
                        className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg"
                        style={{ background: 'var(--primary)', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Upload New
                    </Link>
                </div>
            </div>

            {/* ── Main Card ──────────────────────────────────── */}
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
                {/* Filters bar */}
                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #F1F4F7' }}>
                    {/* Search */}
                    <div className="relative flex-1" style={{ maxWidth: '360px' }}>
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            width="15" height="15" fill="none" viewBox="0 0 24 24"
                            stroke="#9CA3AF" strokeWidth="2.5"
                        >
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by patient or report name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-[13px] font-medium text-gray-700 outline-none rounded-xl placeholder:text-gray-400"
                            style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                        />
                    </div>

                    {/* Category filter */}
                    <div
                        className="relative rounded-xl shrink-0"
                        style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                    >
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-transparent text-[12.5px] font-semibold text-gray-700 outline-none pl-3 pr-8 py-2.5 appearance-none cursor-pointer"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                            ))}
                        </select>
                        <svg
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                            width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2.5"
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    {/* Count badge */}
                    {!loading && (
                        <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-auto shrink-0"
                            style={{ background: '#F4F6F9', color: 'var(--muted-foreground)' }}
                        >
                            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #F1F4F7' }}>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Report</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div
                                            className="w-8 h-8 border-4 rounded-full animate-spin mx-auto"
                                            style={{ borderColor: '#E8EDF2', borderTopColor: 'var(--primary)' }}
                                        />
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                            style={{ background: '#F4F6F9' }}
                                        >
                                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="1.5">
                                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                                <polyline points="14 2 14 8 20 8" />
                                            </svg>
                                        </div>
                                        <p className="text-[13px] font-semibold text-gray-700">No reports found.</p>
                                        <p className="text-[12px] text-gray-400 mt-1">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            ) : filteredReports.map((report) => {
                                const patientName = typeof report.patientId === 'object' ? report.patientId?.name : 'Unknown';
                                const initials = (patientName || 'U').split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                                return (
                                    <tr
                                        key={report._id}
                                        className="hover:bg-gray-50 transition-colors group"
                                        style={{ borderBottom: '1px solid #F1F4F7' }}
                                    >
                                        {/* Report */}
                                        <td className="px-6 py-4">
                                            <p className="text-[13px] font-semibold text-gray-800">{report.reportName}</p>
                                        </td>
                                        {/* Patient */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                                                    style={{ background: '#4A5568' }}
                                                >
                                                    {initials}
                                                </div>
                                                <span className="text-[13px] font-medium text-gray-600">{patientName}</span>
                                            </div>
                                        </td>
                                        {/* Test type */}
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[10px] font-bold px-2.5 py-1 rounded"
                                                style={{ background: '#EBF3FF', color: '#1D62D9' }}
                                            >
                                                {report.testType}
                                            </span>
                                        </td>
                                        {/* Date — use uploadDate → createdAt → reportDate with fallback */}
                                        <td className="px-6 py-4 text-[12px] font-medium text-gray-400">
                                            {(() => {
                                                const raw = report.uploadDate || report.createdAt || report.reportDate;
                                                if (!raw) return '—';
                                                const d = new Date(raw);
                                                return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                            })()}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <a
                                                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${report.fileUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
                                                style={{
                                                    background: '#F4F6F9',
                                                    color: '#374151',
                                                    border: '1px solid #E8EDF2',
                                                }}
                                            >
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="3" />
                                                    <path d="M2 12s3.636-7 10-7 10 7 10 7-3.636 7-10 7S2 12 2 12z" />
                                                </svg>
                                                View
                                            </a>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
