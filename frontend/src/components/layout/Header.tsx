'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { patientService } from '@/services/patientService';
import { reportService } from '@/services/reportService';
import NotificationBell from '@/components/layout/NotificationBell';

export default function Header() {
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const isDoctor = user?.role === 'doctor';
    const isPathology = user?.role === 'pathology';

    /** Map the current path to a human-readable section name */
    const sectionLabel = (() => {
        const seg = pathname.split('/').filter(Boolean);
        const last = seg[seg.length - 1] || '';
        const labelMap: Record<string, string> = {
            dashboard:        'Dashboard',
            reports:          'Medical Reports',
            insights:         'Health Insights',
            analytics:        'Analytics',
            profile:          'Profile',
            upload:           'Upload',
            patients:         'Patients',
            doctors:          'Doctors',
            consultations:    'Consultations',
            'shared-reports': 'Shared Reports',
            'upload-report':  'Upload Report',
            help:             'Profile',
        };
        // If the last segment is a MongoDB ID, look at the one before it
        const isId = /^[a-f0-9]{24}$/.test(last);
        const key = isId ? seg[seg.length - 2] || '' : last;
        return labelMap[key] || (key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ')) || 'Dashboard';
    })();


    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const run = async () => {
            if (query.trim().length < 2) { setResults([]); return; }
            setLoading(true);
            try {
                if (isDoctor) {
                    const pts = await patientService.searchPatients(query);
                    setResults(pts.map(p => ({ id: p._id, title: p.name, subtitle: p.lvId, url: `/dashboard/doctor/patient/${p._id}/dashboard` })));
                } else {
                    const rpts = await reportService.getPatientReports();
                    setResults(rpts.filter(r => r.reportName.toLowerCase().includes(query.toLowerCase())).map(r => ({ id: r._id, title: r.reportName, subtitle: r.testType || 'Report', url: `/dashboard/patient/reports/${r._id}` })));
                }
            } catch { /* silent */ }
            finally { setLoading(false); }
        };
        const t = setTimeout(run, 300);
        return () => clearTimeout(t);
    }, [query, isDoctor]);

    return (
        <header className="h-[64px] bg-white border-b border-gray-100 flex items-center px-7 shrink-0 sticky top-0 z-40">

            {/* Left: section label — flex-1 so it balances with right */}
            <div className="flex items-center gap-2 h-full flex-1">
                {/* Tiny logo mark */}
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#F6D365 0%,#C8A84B 100%)' }}>
                    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                        <path d="M12 2v20M2 12h20" />
                    </svg>
                </div>
                <span className="text-[15px] font-black text-gray-900 tracking-tight shrink-0">{sectionLabel}</span>
            </div>

            {/* Center: Search bar — absolutely centered */}
            <div className="absolute left-1/2 -translate-x-1/2" ref={searchRef}>
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-2 w-[300px]">
                    <svg width="14" height="14" className="text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={e => { setQuery(e.target.value); setShowResults(true); }}
                        onFocus={() => setShowResults(true)}
                        placeholder={
                            isPathology
                                ? 'Search patient ID, doctor or report...'
                                : isDoctor
                                    ? 'Search reports, patients, or tests...'
                                    : 'Search medical data...'
                        }
                        className="bg-transparent text-[13px] text-gray-700 font-medium outline-none w-full placeholder:text-gray-400"
                    />
                </div>
                {showResults && query.trim().length >= 2 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[300px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                        {results.length > 0 ? (
                            <div className="max-h-[280px] overflow-y-auto py-1">
                                {results.map(item => (
                                    <button key={item.id} onClick={() => { router.push(item.url); setShowResults(false); setQuery(''); }}
                                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col">
                                        <span className="text-[13px] font-bold text-gray-800">{item.title}</span>
                                        <span className="text-[11px] text-gray-400">{item.subtitle}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-[12px] text-gray-400">No results found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Icons + Profile — flex-1 justify-end */}
            <div className="flex items-center gap-4 flex-1 justify-end">

                {/* Pathology live status label */}
                {isPathology && (
                    <div className="text-right">
                        <p className="text-[12px] font-bold text-gray-800 leading-tight">Lab Dashboard</p>
                        <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C8A84B] animate-pulse" />
                            <p className="text-[9.5px] text-[#C8A84B] font-bold tracking-widest uppercase">All Systems Active</p>
                        </div>
                    </div>
                )}

                {/* Bell — dynamic, polls backend */}
                <NotificationBell />



                {/* Doctor: Name + Specialty + Avatar */}
                {isDoctor ? (
                    <Link href="/dashboard/doctor/help" className="flex items-center gap-3 cursor-pointer group">
                        <div className="text-right">
                            <p className="text-[13px] font-bold text-gray-800 leading-tight">Dr. {user?.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium">{(user as any)?.specialty || 'Clinical Provider'}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shrink-0 ring-2 ring-amber-100">
                            <span className="text-[14px] font-black text-amber-900">{user?.name?.charAt(0)}</span>
                        </div>
                    </Link>
                ) : (
                    /* Patient: dark circle avatar */
                    <Link href="/dashboard/patient/profile" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-white hover:ring-2 hover:ring-gray-300 transition-all shrink-0">
                        <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </Link>
                )}
            </div>
        </header>
    );
}
