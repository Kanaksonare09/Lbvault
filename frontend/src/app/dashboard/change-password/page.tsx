'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import styles from './page.module.css';

export default function ChangePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { user, login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const token = sessionStorage.getItem('token');
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword: password }),
            });

            if (res.ok) {
                // Refresh user state (locally clear the flag)
                if (user) {
                    const newUser = { ...user, mustChangePassword: false };
                    sessionStorage.setItem('user', JSON.stringify(newUser));
                    // Redirect based on role
                    const rolePath = `/dashboard/${user.role}`;
                    router.push(rolePath);
                }
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to change password');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-xl border border-[var(--border)] animate-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[var(--primary)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <h2 className="text-3xl font-black text-[var(--foreground)] mb-2">Secure Your Account</h2>
                    <p className="text-[var(--muted-foreground)] font-medium leading-relaxed">Please change your temporary password to continue accessing your dashboard.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-400 text-rose-700 text-sm rounded-r-xl animate-in fade-in duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] ml-1">New Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] ml-1">Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] focus:ring-4 focus:ring-[var(--primary)]/10 outline-none transition-all font-medium"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-primary h-14 group mt-4 shadow-lg shadow-[var(--primary)]/20"
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Securing...</span>
                            </div>
                        ) : (
                            <>
                                <span>Change Password</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
