'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';

interface PendingUser {
    _id: string;
    name: string;
    email: string;
    role: 'doctor' | 'pathology';
    status: string;
    createdAt: string;
    registrationNumber?: string;
    licenseNumber?: string;
    labName?: string;
    specialty?: string;
    hospitalName?: string;
}

export default function AdminDashboardPage() {
    const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPendingUsers();
            if (data.success) {
                setPendingUsers(data.users);
            }
        } catch (err) {
            console.error('Failed to fetch pending users', err);
            setStatus({ type: 'error', message: 'Failed to load pending verification queue.' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (userId: string) => {
        try {
            setActionLoading(userId);
            setStatus(null);
            const res = await adminService.approveUser(userId);
            if (res.success) {
                setStatus({ type: 'success', message: 'Account approved successfully.' });
                setPendingUsers(prev => prev.filter(user => user._id !== userId));
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Approval failed.' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (userId: string) => {
        if (!confirm('Are you sure you want to REJECT this application?')) return;
        
        try {
            setActionLoading(userId);
            setStatus(null);
            const res = await adminService.rejectUser(userId);
            if (res.success) {
                setStatus({ type: 'success', message: 'Account rejected.' });
                setPendingUsers(prev => prev.filter(user => user._id !== userId));
            }
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Rejection failed.' });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--foreground)]">Verification Queue</h1>
                <p className="text-[var(--muted-foreground)] mt-1 text-lg font-medium">Verify credentials for medical practitioners and laboratory centers.</p>
            </div>

            {status && (
                <div className={`p-4 rounded-2xl border-l-4 shadow-sm animate-in slide-in-from-top-2 ${
                    status.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700'
                }`}>
                    <p className="font-black flex items-center">
                        {status.type === 'success' ? (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                        {status.message}
                    </p>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-[var(--border)] shadow-sm">
                    <p className="text-[var(--muted-foreground)] text-sm font-bold uppercase tracking-wider">Pending verification</p>
                    <p className="text-4xl font-black text-[var(--foreground)] mt-2">{pendingUsers.length}</p>
                </div>
            </div>

            {/* Verification Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {pendingUsers.length > 0 ? (
                    pendingUsers.map((user) => (
                        <div key={user._id} className="bg-white rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                            <div className="p-8 flex-1">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        user.role === 'doctor' ? 'bg-[var(--secondary)]/20 text-[var(--primary)]' : 'bg-purple-50 text-purple-600'
                                    }`}>
                                        {user.role} Account
                                    </div>
                                    <p className="text-[var(--muted-foreground)] text-xs font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>

                                <div className="flex items-center mb-8">
                                    <div className="w-16 h-16 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-black text-2xl mr-4">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-[var(--foreground)]">{user.name}</h3>
                                        <p className="text-[var(--muted-foreground)] font-medium">{user.email}</p>
                                    </div>
                                </div>

                                <div className="bg-[var(--background)] rounded-2xl p-6 space-y-4 border border-[var(--border)]">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[10px] text-[var(--muted-foreground)] font-black uppercase tracking-tighter">Registration #</p>
                                            <p className="text-sm font-bold text-[var(--foreground)] break-all">{user.registrationNumber || user.licenseNumber || 'Not Provided'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-[var(--muted-foreground)] font-black uppercase tracking-tighter">
                                                {user.role === 'doctor' ? 'Specialization' : 'Lab Identity'}
                                            </p>
                                            <p className="text-sm font-bold text-[var(--foreground)]">{user.specialty || user.labName || 'General Practice'}</p>
                                        </div>
                                    </div>
                                    {user.role === 'doctor' && user.hospitalName && (
                                        <div>
                                            <p className="text-[10px] text-[var(--muted-foreground)] font-black uppercase tracking-tighter">Hospital / Clinic</p>
                                            <p className="text-sm font-bold text-[var(--foreground)]">{user.hospitalName}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-[var(--background)]/50 border-t border-[var(--border)] flex gap-4">
                                <button
                                    onClick={() => handleApprove(user._id)}
                                    disabled={!!actionLoading}
                                    className="flex-1 bg-emerald-600 text-white font-black py-4 rounded-2xl hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex items-center justify-center"
                                >
                                    {actionLoading === user._id ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                            Approve Access
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleReject(user._id)}
                                    disabled={!!actionLoading}
                                    className="px-6 bg-white text-rose-500 border border-rose-100 font-black py-4 rounded-2xl hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full bg-white rounded-[2rem] border border-dashed border-[var(--border)] p-16 text-center">
                        <div className="w-20 h-20 bg-[var(--background)] rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-2xl font-black text-[var(--foreground)]">Queue Empty</h3>
                        <p className="text-[var(--muted-foreground)] mt-2 font-medium">All pending applications have been processed.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
