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
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center px-8 shrink-0 sticky top-0 z-40">

            {/* Left: Nav Links */}
            <div className="flex items-center gap-8 flex-1 h-full">
                {['Dashboard', 'Patients', 'Reports'].map((item) => (
                    <Link
                        key={item}
                        href={isDoctor ? `/dashboard/doctor/${item.toLowerCase() === 'dashboard' ? '' : item.toLowerCase()}` : '#'}
                        className="text-[14px] font-medium text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        {item}
                    </Link>
                ))}
            </div>

            {/* Center: Search bar */}
            <div className="flex-1 flex justify-center" ref={searchRef}>
                <div className="relative w-full max-w-[480px]">
                    <div className="flex items-center bg-[#F1F5F5] rounded-xl px-4 py-3 gap-3">
                        <svg width="18" height="18" className="text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={e => { setQuery(e.target.value); setShowResults(true); }}
                            onFocus={() => setShowResults(true)}
                            placeholder="Search patients..."
                            className="bg-transparent text-[14px] text-gray-700 font-medium outline-none w-full placeholder:text-gray-400"
                        />
                    </div>
                    {showResults && query.trim().length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                            {results.length > 0 ? (
                                <div className="max-h-[280px] overflow-y-auto py-1">
                                    {results.map(item => (
                                        <button key={item.id} onClick={() => { router.push(item.url); setShowResults(false); setQuery(''); }}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex flex-col">
                                            <span className="text-[14px] font-bold text-gray-800">{item.title}</span>
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
            </div>

            {/* Right: Actions + Profile */}
            <div className="flex items-center gap-6 flex-1 justify-end">
                <NotificationBell />
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[14px] font-bold text-gray-900 leading-none">Dr. {user?.name?.toUpperCase()}</p>
                        <p className="text-[11px] text-gray-400 font-medium mt-1">Clinical Provider</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#E5F0F0] text-[#4F6F6F] flex items-center justify-center font-bold text-[14px]">
                        {user?.name?.charAt(0).toUpperCase()}
                    </div>
                </div>
            </div>
        </header>
    );
}
