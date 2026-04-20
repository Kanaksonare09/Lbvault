'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { pathologyService } from '@/services/pathologyService';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [labName, setLabName] = useState<string>('');

    const isPathology = user?.role === 'pathology';
    const isDoctor = user?.role === 'doctor';
    const isPatient = user?.role === 'patient';

    // Fetch lab name for pathology users
    useEffect(() => {
        if (isPathology) {
            pathologyService.getProfile()
                .then((profile) => {
                    if (profile?.labName) setLabName(profile.labName);
                })
                .catch(() => { /* silent — fallback to "Lab Portal" */ });
        }
    }, [isPathology]);

    const menuItems = {
        // Task 4: Dashboard restored; Reports + Insights were only removed from the header
        pathology: [
            { name: 'Dashboard', path: '/dashboard/pathology', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> },
            { name: 'Upload', path: '/dashboard/pathology/upload-report', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> },
            { name: 'Patients', path: '/dashboard/pathology/patients', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
            { name: 'Doctors', path: '/dashboard/pathology/doctors', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M16 11h6" /></svg> },
            { name: 'Analytics', path: '/dashboard/pathology/analytics', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
            { name: 'Profile', path: '/dashboard/pathology/profile', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        ],
        patient: [
            { name: 'Dashboard', path: '/dashboard/patient', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> },
            { name: 'Reports', path: '/dashboard/patient/reports', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg> },
            { name: 'Insights', path: '/dashboard/patient/insights', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg> },
            { name: 'Analytics', path: '/dashboard/patient/analytics', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg> },
            { name: 'Profile', path: '/dashboard/patient/profile', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
        ],
        doctor: [
            { name: 'Dashboard', path: '/dashboard/doctor', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg> },
            { name: 'Reports',  path: '/dashboard/doctor/shared-reports', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg> },
            { name: 'Patients', path: '/dashboard/doctor/patients', icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
        ],

    };

    const currentRoleItems = menuItems[user?.role as keyof typeof menuItems] || [];

    // For pathology active-path matching — Dashboard is gone from nav so skip exact "/dashboard/pathology" check
    const isPathologyDashboard = isPathology && pathname === '/dashboard/pathology';

    return (
        <aside className="w-[210px] bg-white flex flex-col h-full z-20 shrink-0 border-r border-gray-100">

            {/* ── Brand ─────────────────────────────────────── */}
            <div className="px-5 pt-6 pb-5">
                <Link href={isPathology ? '/dashboard/pathology' : `/dashboard/${user?.role}`} className="block">
                    <div className="flex items-center gap-2.5">
                        {/* Logo mark — amber gradient health cross */}
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg,#F6D365 0%,#C8A84B 100%)', boxShadow: '0 2px 8px rgba(200,168,75,0.35)' }}>
                            <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" viewBox="0 0 24 24">
                                <path d="M12 2v20M2 12h20" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            {isPathology ? (
                                <>
                                    <h2
                                        className="font-black text-gray-900 tracking-tight leading-tight"
                                        style={{ fontSize: labName && labName.length > 14 ? '12px' : '14px', lineHeight: 1.2 }}
                                    >
                                        {labName || 'Lab Portal'}
                                    </h2>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-[15px] font-black text-gray-900 tracking-tight leading-none">HealthScan</h2>
                                </>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* ── Nav ───────────────────────────────────────── */}
            <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
                {currentRoleItems.map((item) => {
                    const isExact = pathname === item.path;
                    const isActive = isExact || (
                        item.path !== '/dashboard/doctor' &&
                        item.path !== '/dashboard/patient' &&
                        pathname.startsWith(item.path + '/')
                    );
                    return (
                        <Link
                            key={item.name}
                            href={item.path}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-semibold transition-colors ${isActive
                                ? 'bg-[#FCEEA5] text-[#5C4A1E]'
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <span className={isActive ? 'text-[#9A7A35]' : 'text-gray-400'}>{item.icon}</span>
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section ────────────────────────────── */}
            <div className="px-3 pb-5 mt-auto space-y-1">


                {/* Doctor: Profile link */}
                {isDoctor && (
                    <a href="/dashboard/doctor/profile" className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-semibold text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        My Profile
                    </a>
                )}

                {/* Pathology: User profile card only (Task 2: Support removed) */}
                {isPathology && (
                    <div className="flex items-center gap-2.5 px-3 py-3 rounded-xl mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center shrink-0 ring-2 ring-amber-100">
                            <span className="text-[13px] font-black text-amber-900">
                                {user?.name?.charAt(0) ?? 'L'}
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-[12px] font-bold text-gray-800 leading-tight truncate">{user?.name}</p>
                            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">Pathologist</p>
                        </div>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-[13px] font-semibold text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Logout
                </button>
            </div>
        </aside>
    );
}
