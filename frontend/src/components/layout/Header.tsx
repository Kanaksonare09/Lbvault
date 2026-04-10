'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const { user } = useAuth();
    const pathname = usePathname();

    const doctorTabs = [
        { name: 'Dashboard', path: '/dashboard/doctor' },
        { name: 'Patients', path: '/dashboard/doctor/patients' },
        { name: 'Reports', path: '/dashboard/doctor/shared-reports' },
    ];

    const isDoctor = user?.role === 'doctor';

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
                                        ? 'text-[#1E3799] border-b-2 border-[#F5C842]'
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
            <div className="flex-1 max-w-sm mx-8">
                <div className="relative">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        type="text"
                        placeholder="Search patients..."
                        className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all placeholder:text-gray-400"
                    />
                </div>
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
                        <p className="text-sm font-bold text-gray-700 leading-tight">Dr. {user?.name?.split(' ').pop()}</p>
                        <p className="text-xs text-gray-400">{user?.role === 'doctor' ? 'Lead Cardiologist' : user?.role}</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden group-hover:ring-2 group-hover:ring-blue-300 transition-all">
                        <span className="text-sm font-bold text-gray-500">{user?.name?.charAt(0)}</span>
                    </div>
                </Link>
            </div>
        </header>
    );
}
