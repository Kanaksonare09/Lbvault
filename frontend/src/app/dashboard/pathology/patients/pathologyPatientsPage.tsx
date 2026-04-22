'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { patientService } from '@/services/patientService';

export default function PatientsPage() {
    const [patients, setPatients] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchPatients = async (searchQuery: string) => {
        setLoading(true);
        try {
            const data = await patientService.searchPatients(searchQuery);
            setPatients(data);
        } catch (err) {
            console.error('Failed to fetch patients', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const t = setTimeout(() => fetchPatients(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    return (
        <div className="space-y-5">

            {/* ── Page Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-black text-gray-900"
                        style={{ fontSize: '1.55rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}
                    >
                        Patient Directory
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-1 font-medium">
                        Search registered patients and upload their lab reports.
                    </p>
                </div>
                <Link
                    href="/dashboard/pathology/upload-report"
                    className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    style={{ background: 'var(--primary)', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Report
                </Link>
            </div>

            {/* ── Main Card ──────────────────────────────────── */}
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
                {/* Search bar */}
                <div className="px-6 py-4" style={{ borderBottom: '1px solid #F1F4F7' }}>
                    <div className="relative" style={{ maxWidth: '420px' }}>
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            width="15" height="15" fill="none" viewBox="0 0 24 24"
                            stroke="#9CA3AF" strokeWidth="2.5"
                        >
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, email, or patient ID..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-[13px] font-medium text-gray-700 outline-none rounded-xl placeholder:text-gray-400"
                            style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #F1F4F7' }}>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Patient</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Demographics</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div
                                            className="w-8 h-8 border-4 rounded-full animate-spin mx-auto"
                                            style={{ borderColor: '#E8EDF2', borderTopColor: 'var(--primary)' }}
                                        />
                                    </td>
                                </tr>
                            ) : patients.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                            style={{ background: '#F4F6F9' }}
                                        >
                                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="1.5">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <p className="text-[13px] font-semibold text-gray-700">
                                            {query ? 'No patients match your search.' : 'No patients yet.'}
                                        </p>
                                        <p className="text-[12px] text-gray-400 mt-1">
                                            Patients self-register via the signup page.
                                        </p>
                                    </td>
                                </tr>
                            ) : patients.map((patient) => {
                                const initials = (patient.name || 'P')
                                    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                                return (
                                    <tr
                                        key={patient._id}
                                        className="hover:bg-gray-50 transition-colors"
                                        style={{ borderBottom: '1px solid #F1F4F7' }}
                                    >
                                        {/* Patient */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                                    style={{ background: '#4A5568' }}
                                                >
                                                    {initials}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-gray-800">{patient.name}</p>
                                                    <p className="text-[11px] text-gray-400">
                                                        {patient.patientCustomId || `ID: ${patient._id.slice(-6)}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Contact */}
                                        <td className="px-6 py-4">
                                            <p className="text-[13px] text-gray-700 font-medium">{patient.email}</p>
                                            <p className="text-[11px] text-gray-400 mt-0.5">{patient.phone || '—'}</p>
                                        </td>
                                        {/* Demographics */}
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5 flex-wrap items-center">
                                                {patient.age ? (
                                                    <span
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                                                        style={{ background: 'var(--accent)', color: 'var(--primary)' }}
                                                    >
                                                        {patient.age} yrs
                                                    </span>
                                                ) : null}
                                                {patient.gender ? (
                                                    <span
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded capitalize"
                                                        style={{ background: '#EFF6FF', color: '#1D4ED8' }}
                                                    >
                                                        {patient.gender}
                                                    </span>
                                                ) : null}
                                                {patient.bloodGroup ? (
                                                    <span
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                                                        style={{ background: '#FEE2E2', color: '#991B1B' }}
                                                    >
                                                        {patient.bloodGroup}
                                                    </span>
                                                ) : null}
                                                {!patient.age && !patient.gender && !patient.bloodGroup && (
                                                    <span className="text-[11px] text-gray-400 font-medium italic">Not provided</span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/dashboard/pathology/upload-report?patientId=${patient._id}&name=${encodeURIComponent(patient.name)}`}
                                                className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                                                style={{
                                                    background: 'var(--accent)',
                                                    color: 'var(--primary)',
                                                    border: '1px solid #FDE68A',
                                                }}
                                            >
                                                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="17 8 12 3 7 8" />
                                                    <line x1="12" y1="3" x2="12" y2="15" />
                                                </svg>
                                                Upload Report
                                            </Link>
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
