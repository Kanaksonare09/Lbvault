'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            console.log('DashboardLayout: No user, redirecting to /login');
            router.push('/login');
            return;
        }

        // New structure: /dashboard/[role]/... 
        // SuperAdmin maps to the 'admin' directory
        const roleFolder = user.role === 'SuperAdmin' ? 'admin' : user.role;
        const rolePath = `/dashboard/${roleFolder}`;
        const isAllowedPath = pathname === rolePath || pathname.startsWith(rolePath + '/');

        console.log('DashboardLayout debug:', {
            pathname,
            rolePath,
            isAllowedPath,
            userRole: user.role
        });

        if (!isAllowedPath) {
            console.log('DashboardLayout: Unauthorized path, redirecting to', rolePath);
            router.push(rolePath);
        } else {
            console.log('DashboardLayout: Path is authorized');
            setIsAuthorized(true);
        }
    }, [user, loading, router, pathname]);

    if (loading || !user || !isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F7F5]">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin mb-4"></div>
                    <p className="text-[#4F6F6F] font-bold tracking-tight">
                        {loading ? 'Authenticating...' : !isAuthorized ? 'Securely redirecting...' : 'Loading Dashboard...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Header />

                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
