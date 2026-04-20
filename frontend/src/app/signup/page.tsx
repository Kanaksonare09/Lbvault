'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
        age: '',
        gender: 'Male',
        medicalLicenseNumber: '',
        specialization: '',
        labName: '',
        registrationNumber: '',
        address: '',
        hospitalName: '',
        degreeCertificate: null as File | null,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, user, loading } = useAuth();
    const router = useRouter();

    // Redirect already-logged-in users away from signup page
    useEffect(() => {
        if (!loading && user) {
            const routes: Record<string, string> = {
                pathology: '/dashboard/pathology',
                doctor: '/dashboard/doctor',
                patient: '/dashboard/patient',
            };
            router.replace(routes[user.role] || '/dashboard/patient');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const password = formData.password;
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        setPasswordStrength(strength);
    }, [formData.password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            let res;

            if (formData.role === 'doctor') {
                const data = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        data.append(key, value as string | Blob);
                    }
                });
                
                res = await fetch(`${apiUrl}/api/auth/signup/doctor`, {
                    method: 'POST',
                    body: data,
                });
            } else {
                res = await fetch(`${apiUrl}/api/auth/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData),
                });
            }

            const data = await res.json();

            if (res.ok) {
                if (data.token) {
                    login(data.user, data.token);
                } else {
                    alert('Registration successful! Your account is pending admin approval.');
                    router.push('/login');
                }
            } else {
                setError(data.message || 'Signup failed');
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
                            <span className="text-white font-bold text-2xl italic">H</span>
                        </div>
                        <span className="text-3xl font-bold tracking-tight">HealthScan</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-lg mb-12">
                    <h1 className="text-5xl font-extrabold text-[#F6F7F5] leading-tight mb-6">
                        Integrated health tech for healthcare leaders.
                    </h1>
                    <p className="text-xl text-[#8FB9A8] leading-relaxed">
                        Join our ecosystem designed for physicians, patients, and laboratory managers.
                        Professional tools scaled for your specialty.
                    </p>
                </div>

                {/* Illustration with specified artifact image */}
                <div className="absolute inset-0 opacity-15 mix-blend-soft-light pointer-events-none">
                    <Image
                        src="/images/auth-illustration.png"
                        alt="HealthScan Authentication Illustration"
                        fill
                        className="object-cover scale-110 -rotate-3"
                    />
                </div>
                {/* Vignette for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F6F6F]/40 to-black/30 pointer-events-none" />
            </div>

            {/* Right Section: Form */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 md:p-16 bg-[#F6F7F5]">
                <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-8 lg:hidden text-center">
                        <Link href="/" className="inline-flex items-center space-x-2 text-[#4F6F6F]">
                            <div className="w-10 h-10 bg-[#4F6F6F] rounded-xl flex items-center justify-center text-white font-bold">H</div>
                            <span className="text-2xl font-bold">HealthScan</span>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-[#1F2933] mb-3">Join HealthScan.</h2>
                        <p className="text-[#6B7280] text-lg">Start managing your digital health today.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-xl">
                            <span className="font-semibold block mb-1">Registration Error</span>
                            {error}
                        </div>
                    )}

                    {formData.role === 'patient' && (
                        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-[#8FB9A8] text-[#4F6F6F] text-sm rounded-r-xl font-medium">
                            <span className="font-bold block mb-1">Welcome!</span>
                            Your patient account will be instantly active upon registration.
                        </div>
                    )}
                    {(formData.role === 'doctor' || formData.role === 'pathology') && (
                        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 text-orange-700 text-sm rounded-r-xl font-medium">
                            <span className="font-bold block mb-1">Approval Required</span>
                            Your account will be added as "pending" and requires admin verification.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="floating-label-group">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder=" "
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <label htmlFor="name">Full Name</label>
                        </div>

                        <div className="floating-label-group">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder=" "
                                required
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <label htmlFor="email">Email Address</label>
                        </div>

                        <div className="floating-label-group relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                id="password"
                                placeholder=" "
                                required
                                value={formData.password}
                                onChange={handleChange}
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

                            {/* Password Strength Indicator */}
                            <div className="flex gap-1 mt-2 px-1">
                                {[25, 50, 75, 100].map((step) => (
                                    <div
                                        key={step}
                                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${passwordStrength >= step
                                            ? passwordStrength <= 50 ? 'bg-orange-400' : 'bg-[#8FB9A8]'
                                            : 'bg-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="floating-label-group">
                            <select
                                name="role"
                                id="role"
                                required
                                value={formData.role}
                                onChange={handleChange}
                            >
                                <option value="" disabled hidden></option>
                                <option value="patient">Patient</option>
                                <option value="doctor">Doctor</option>
                                <option value="pathology">Pathology Administrator</option>
                            </select>
                            <label htmlFor="role">Your Role</label>
                        </div>

                        {formData.role === 'patient' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="floating-label-group">
                                    <input type="number" name="age" id="age" placeholder=" " required value={formData.age} onChange={handleChange} />
                                    <label htmlFor="age">Age</label>
                                </div>
                                <div className="floating-label-group">
                                    <select name="gender" id="gender" required value={formData.gender} onChange={handleChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <label htmlFor="gender">Gender</label>
                                </div>
                            </div>
                        )}

                        {formData.role === 'doctor' && (
                            <>
                                <div className="floating-label-group">
                                    <input type="text" name="medicalLicenseNumber" id="medicalLicenseNumber" placeholder=" " required value={formData.medicalLicenseNumber} onChange={handleChange} />
                                    <label htmlFor="medicalLicenseNumber">Medical License Number</label>
                                </div>
                                <div className="floating-label-group">
                                    <input type="text" name="hospitalName" id="hospitalName" placeholder=" " required value={formData.hospitalName} onChange={handleChange} />
                                    <label htmlFor="hospitalName">Hospital / Clinic Name</label>
                                </div>
                                <div className="floating-label-group">
                                    <input type="text" name="specialization" id="specialization" placeholder=" " required value={formData.specialization} onChange={handleChange} />
                                    <label htmlFor="specialization">Specialization</label>
                                </div>
                                <div className="mt-2">
                                    <label className="block text-sm font-medium text-[#4F6F6F] mb-2 font-semibold">Degree / Certificate (PDF/Image)</label>
                                    <div className="relative group/file">
                                        <input 
                                            type="file" 
                                            name="degreeCertificate" 
                                            id="degreeCertificate"
                                            accept=".pdf,.jpg,.jpeg,.png" 
                                            required 
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setFormData({ ...formData, degreeCertificate: e.target.files[0] });
                                                }
                                            }}
                                            className="hidden"
                                        />
                                        <label 
                                            htmlFor="degreeCertificate"
                                            className="w-full flex items-center justify-center space-x-3 px-4 py-4 border-2 border-dashed border-[#8FB9A8] rounded-xl bg-white hover:bg-[#8FB9A8]/5 hover:border-[#4F6F6F] transition-all cursor-pointer group"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4F6F6F]"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                            <span className="text-[#4F6F6F] font-medium">
                                                {formData.degreeCertificate ? formData.degreeCertificate.name : 'Upload Medical Certificate'}
                                            </span>
                                        </label>
                                    </div>
                                    <p className="mt-2 text-xs text-[#6B7280]">Supported: PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                            </>
                        )}

                        {formData.role === 'pathology' && (
                            <>
                                <div className="floating-label-group">
                                    <input type="text" name="labName" id="labName" placeholder=" " required value={formData.labName} onChange={handleChange} />
                                    <label htmlFor="labName">Lab Name</label>
                                </div>
                                <div className="floating-label-group">
                                    <input type="text" name="registrationNumber" id="registrationNumber" placeholder=" " required value={formData.registrationNumber} onChange={handleChange} />
                                    <label htmlFor="registrationNumber">Registration Number / License</label>
                                </div>
                                <div className="floating-label-group">
                                    <input type="text" name="address" id="address" placeholder=" " required value={formData.address} onChange={handleChange} />
                                    <label htmlFor="address">Full Address</label>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary h-14 group mt-2"
                        >
                            {isLoading ? (
                                <div className="flex items-center space-x-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Get started for free</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[#6B7280] text-lg">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#4F6F6F] font-bold hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
