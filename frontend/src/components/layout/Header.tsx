'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { patientService } from '@/services/patientService';
import { reportService } from '@/services/reportService';

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

    const doctorTabs = [
        { name: 'Dashboard', path: '/dashboard/doctor' },
        { name: 'Patients', path: '/dashboard/doctor/patients' },
        { name: 'Reports', path: '/dashboard/doctor/shared-reports' },
    ];

    // Handle clicks outside search UI
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Perform search
    useEffect(() => {
        const performSearch = async () => {
            if (query.trim().length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                if (isDoctor) {
                    const patients = await patientService.searchPatients(query);
                    setResults(patients.map(p => ({
                        id: p._id,
                        title: p.name,
                        subtitle: p.lvId,
                        url: `/dashboard/doctor/patient/${p._id}/dashboard`,
                        type: 'Patient'
                    })));
                } else {
                    const reports = await reportService.getPatientReports();
                    const filtered = reports.filter(r => 
                        r.reportName.toLowerCase().includes(query.toLowerCase()) ||
                        r.testType?.toLowerCase().includes(query.toLowerCase())
                    );
                    setResults(filtered.map(r => ({
                        id: r._id,
                        title: r.reportName,
                        subtitle: r.testType || 'Report',
                        url: `/dashboard/patient/reports/${r._id}`,
                        type: 'Report'
                    })));
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [query, isDoctor]);

    return (
        <header className="h-[70px] bg-white border-b border-gray-100 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm">
            {/* Left: Tab Navigation (Doctor only) */}
            <div className="flex items-center gap-6">
                {isDoctor ? (
                    doctorTabs.map((tab) => {
                        const isActive = pathname === tab.path ||
                            (tab.path !== '/dashboard/doctor' && pathname.startsWith(tab.path));
                        return (
                            <Link
                                key={tab.name}
                                href={tab.path}
                                className={`text-sm font-semibold pb-1 transition-all ${isActive
                                        ? 'text-[#4F6F6F] border-b-2 border-[#F5C842]'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {tab.name}
                            </Link>
                        );
                    })
                ) : (
                    <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">Dashboard</span>
                )}
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
                <div className="relative">
                    <svg className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'text-[#4F6F6F]' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {loading ? (
                             <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83">
                                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
                             </path>
                        ) : (
                            <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>
                        )}
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setShowResults(true);
                        }}
                        onFocus={() => setShowResults(true)}
                        placeholder={isDoctor ? "Search patients..." : "Search reports..."}
                        className="w-full bg-[#F1F5F5] border-2 border-transparent focus:border-[#4F6F6F]/20 rounded-2xl py-2.5 pl-12 pr-4 text-sm text-[#2D3A3A] font-bold outline-none transition-all placeholder:text-[#7A9999] shadow-sm"
                    />
                </div>

                {/* Search Results Dropdown */}
                {showResults && (query.trim().length >= 2) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E2E8F0] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {results.length > 0 ? (
                            <div className="max-h-[400px] overflow-y-auto">
                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-gray-400">
                                    <span>{results.length} Found</span>
                                    <span>{results[0].type}s</span>
                                </div>
                                {results.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            router.push(item.url);
                                            setShowResults(false);
                                            setQuery('');
                                        }}
                                        className="w-full px-5 py-4 text-left hover:bg-[#F1F5F5] border-b border-[#E2E8F0] last:border-0 flex items-center justify-between group transition-all"
                                    >
                                        <div>
                                            <p className="font-black text-[#2D3A3A] group-hover:text-[#4F6F6F] transition-colors">{item.title}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-black uppercase bg-[#8FB9A8]/10 text-[#4F6F6F] px-1.5 py-0.5 rounded">
                                                    {item.subtitle}
                                                </span>
                                            </div>
                                        </div>
                                        <svg className="w-5 h-5 text-[#8FB9A8] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-8 py-10 text-center">
                                <div className="w-12 h-12 bg-[#F6F7F5] rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                </div>
                                <p className="text-sm font-black text-[#2D3A3A]">No {isDoctor ? 'patients' : 'reports'} found</p>
                                <p className="text-[10px] text-[#7A9999] mt-1">Try a different search term</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right: Icons + Avatar */}
            <div className="flex items-center gap-3">
                {/* Notification Bell */}
                <button className="relative w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                </button>

                {/* Settings */}
                <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                </button>

                {/* Avatar */}
                <Link href={`/dashboard/${user?.role}/profile`} className="flex items-center gap-3 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-gray-700 leading-tight">
                            {isDoctor && 'Dr. '}{user?.name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{user?.role === 'doctor' ? 'Clinical Provider' : user?.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-[#8FB9A8] transition-all">
                        <span className="text-sm font-bold text-gray-500">{user?.name?.charAt(0)}</span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
