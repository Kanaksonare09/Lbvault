'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, user, loading } = useAuth();
    const router = useRouter();

    // Redirect already-logged-in users away from login page
    useEffect(() => {
        if (!loading && user) {
            const routes: Record<string, string> = {
                pathology: '/dashboard/pathology',
                doctor: '/dashboard/doctor',
                patient: '/dashboard/patient',
                SuperAdmin: '/dashboard/admin',
            };
            router.replace(routes[user.role] || '/dashboard/patient');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                login(data.user, data.token);
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-split-grid">
            {/* Left Section: Branding & Illustration */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-[#4F6F6F] relative overflow-hidden">
                <div className="relative z-10">
                    <Link href="/" className="inline-flex items-center space-x-3 text-white">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                            <span className="text-white font-bold text-2xl italic">L</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">LabVault</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mb-12">
                    <h1 className="text-5xl font-extrabold text-[#F6F7F5] leading-tight mb-6">
                        Secure medical records for a modern era.
                    </h1>
                    <p className="text-xl text-[#8FB9A8] leading-relaxed">
                        Join thousands of patients and doctors who trust LabVault for their digital healthcare journey.
                        Professional, private, and powerful.
                    </p>
                </div>

                {/* Abstract shape context placeholder */}
                <div className="absolute top-0 right-0 w-full h-full opacity-40 mix-blend-overlay">
                    <Image
                        src="/illustration.png"
                        alt="Medical Illustration"
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Right Section: Form */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-[#F6F7F5]">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-10 lg:hidden text-center">
                        <Link href="/" className="inline-flex items-center space-x-2 text-[#4F6F6F]">
                            <div className="w-10 h-10 bg-[#4F6F6F] rounded-xl flex items-center justify-center text-white font-bold">L</div>
                            <span className="text-2xl font-bold">LabVault</span>
                        </Link>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-[#1F2933] mb-3">Welcome back.</h2>
                        <p className="text-[#6B7280] text-lg">Enter your details to access your account.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-xl">
                            <span className="font-semibold block mb-1">Error Occurred</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="floating-label-group">
                            <input
                                type="email"
                                id="email"
                                placeholder=" "
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <label htmlFor="email">Email Address</label>
                        </div>

                        <div className="floating-label-group relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                placeholder=" "
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label htmlFor="password">Password</label>
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#4F6F6F] transition-colors p-2"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88L4.62 4.62" /><path d="M1 1l22 22" /><path d="M12 18a6.3 6.3 0 01-6.15-4.5" /><path d="M19.12 15.12a6.3 6.3 0 00-4.24-4.24" /><path d="M16 11.2a2 2 0 00-1.2-1.2" /><path d="M14.9 14.9a2 2 0 01-1.1 1.1" /><path d="M2.38 5.38A10.74 10.74 0 001 12c.33 1.9 1 3.68 2 5.24" /><path d="M22.62 18.62A10.74 10.74 0 0023 12c-1.37-3.9-4.88-6.8-9.1-7.14" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z" /><circle cx="12" cy="12" r="3" /></svg>
                                )}
                            </button>
                        </div>

                        <div className="flex items-center justify-between pb-4">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] text-[#4F6F6F] focus:ring-[#4F6F6F] transition-all cursor-pointer" />
                                <span className="text-sm text-[#6B7280] group-hover:text-[#4F6F6F] transition-colors">Remember me</span>
                            </label>
                            <Link href="#" className="text-sm font-semibold text-[#4F6F6F] hover:underline">Forgot password?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary h-14 group"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-[#6B7280] text-lg">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-[#4F6F6F] font-bold hover:underline">
                            Create for free
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
