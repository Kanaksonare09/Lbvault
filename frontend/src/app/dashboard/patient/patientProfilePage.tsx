'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import api from '@/services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LANGUAGES = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'Hindi (हिंदी)' },
    { code: 'mr', label: 'Marathi (मराठी)' },
    { code: 'te', label: 'Telugu (తెలుగు)' },
];

function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-[var(--accent-soft)] border border-[var(--border)] rounded-2xl animate-in fade-in duration-300">
            <div className="w-7 h-7 bg-[var(--primary)] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <p className="text-sm font-bold text-[var(--primary)] flex-1">{message}</p>
            <button onClick={onDismiss} className="text-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <div className="w-7 h-7 bg-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <p className="text-sm font-bold text-rose-700">{message}</p>
        </div>
    );
}

export default function PatientProfilePage() {
    const { user, refreshUser } = useAuth();

    // Profile form state
    const [form, setForm] = useState({
        name: '', phone: '', address: '',
        dateOfBirth: '', gender: '', bloodGroup: '',
        emergencyContactName: '', emergencyContactPhone: '', preferredLanguage: 'en'
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileMsg, setProfileMsg] = useState('');
    const [profileErr, setProfileErr] = useState('');

    // Password form state
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg] = useState('');
    const [pwErr, setPwErr] = useState('');
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    // Active tab
    const [tab, setTab] = useState<'profile' | 'security'>('profile');

    // Load current profile on mount
    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                const u = res.data;
                const p = u.profile || {};
                setForm({
                    name: u.name || '',
                    phone: u.phone || '',
                    address: u.address || '',
                    dateOfBirth: p.dateOfBirth ? p.dateOfBirth.substring(0, 10) : '',
                    gender: p.gender || '',
                    bloodGroup: p.bloodGroup || '',
                    emergencyContactName: p.emergencyContactName || '',
                    emergencyContactPhone: p.emergencyContactPhone || '',
                    preferredLanguage: p.preferredLanguage || 'en',
                });
            })
            .catch(() => { })
            .finally(() => setProfileLoading(false));
    }, []);

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileMsg('');
        setProfileErr('');
        try {
            const res = await api.put('/auth/profile', form);
            setProfileMsg('Profile updated successfully! ✅');
            await refreshUser();
        } catch (err: any) {
            setProfileErr(err?.response?.data?.message || 'Failed to save profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwMsg('');
        setPwErr('');
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwErr('New passwords do not match.');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwErr('New password must be at least 6 characters.');
            return;
        }
        setPwSaving(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: pwForm.currentPassword,
                newPassword: pwForm.newPassword
            });
            setPwMsg('Password changed successfully! ✅');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPwErr(err?.response?.data?.message || 'Failed to change password.');
        } finally {
            setPwSaving(false);
        }
    };

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-[0.2em]">{label}</label>
            {children}
        </div>
    );

    const inputCls = "w-full px-4 py-2.5 bg-[#F8FAFC] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all placeholder-[#94A3B8]";

    if (profileLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-10 h-10 border-[var(--primary)] border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8 pb-12 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/patient"
                    className="p-3 bg-white border border-[var(--border)] rounded-2xl text-gray-500 hover:bg-[var(--accent-soft)] hover:text-[var(--primary)] transition-all shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Profile Settings</h1>
                    <p className="text-[var(--muted-foreground)] font-medium mt-0.5">Manage your personal information and security</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left: Avatar + Quick Info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-[var(--border)] text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <span className="text-3xl font-black text-white">
                                {form.name ? getInitials(form.name) : 'LV'}
                            </span>
                        </div>
                        <h2 className="text-lg font-black text-[var(--foreground)]">{form.name || user?.name}</h2>
                        <p className="text-xs font-bold text-[var(--primary)] mt-1">{user?.email}</p>
                        <div className="mt-4 flex flex-col gap-2">
                            {form.bloodGroup && (
                                <div className="flex items-center justify-between px-3 py-2 bg-rose-50 rounded-xl">
                                    <span className="text-[10px] font-black text-rose-400 uppercase">Blood</span>
                                    <span className="text-sm font-black text-rose-600">{form.bloodGroup}</span>
                                </div>
                            )}
                            {form.gender && (
                                <div className="flex items-center justify-between px-3 py-2 bg-[var(--background)] rounded-xl">
                                    <span className="text-[10px] font-black text-[var(--muted-foreground)] uppercase">Gender</span>
                                    <span className="text-sm font-black text-[var(--foreground)] capitalize">{form.gender}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="bg-white border border-[var(--border)] rounded-2xl p-1.5 shadow-sm flex flex-col gap-1">
                        {[
                            { key: 'profile', icon: '👤', label: 'Edit Profile' },
                            { key: 'security', icon: '🔒', label: 'Change Password' },
                        ].map(t => (
                            <button key={t.key} onClick={() => setTab(t.key as any)}
                                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-black transition-all text-left ${tab === t.key ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted-foreground)] hover:bg-[var(--accent-soft)]'
                                    }`}>
                                <span>{t.icon}</span>
                                <span>{t.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-3">
                    {tab === 'profile' && (
                        <form onSubmit={handleProfileSave} className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--border)] space-y-6">
                            <h3 className="text-lg font-black text-[var(--foreground)]">Personal Information</h3>

                            {profileMsg && <SuccessBanner message={profileMsg} onDismiss={() => setProfileMsg('')} />}
                            {profileErr && <ErrorBanner message={profileErr} />}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <Field label="Full Name">
                                    <input id="profile-name" className={inputCls} value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                        placeholder="Your full name" required />
                                </Field>
                                <Field label="Mobile Number">
                                    <input id="profile-phone" className={inputCls} value={form.phone}
                                        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                        placeholder="+91 00000 00000" type="tel" />
                                </Field>
                                <Field label="Date of Birth">
                                    <input id="profile-dob" className={inputCls} value={form.dateOfBirth}
                                        onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                                        type="date" />
                                </Field>
                                <Field label="Gender">
                                    <select id="profile-gender" className={inputCls} value={form.gender}
                                        onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                                        <option value="">Select gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </Field>
                                <Field label="Blood Group">
                                    <select id="profile-blood" className={inputCls} value={form.bloodGroup}
                                        onChange={e => setForm(f => ({ ...f, bloodGroup: e.target.value }))}>
                                        <option value="">Select blood group</option>
                                        {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                    </select>
                                </Field>
                                <Field label="Preferred Language">
                                    <select id="profile-lang" className={inputCls} value={form.preferredLanguage}
                                        onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}>
                                        {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                                    </select>
                                </Field>
                                <Field label="Home Address">
                                    <input className={inputCls} value={form.address}
                                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                                        placeholder="City, State" />
                                </Field>
                            </div>

                            <div className="pt-2 border-t border-[#F1F5F9]">
                                <h4 className="text-sm font-black text-[var(--primary)] mb-4">Emergency Contact</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label="Contact Name">
                                        <input className={inputCls} value={form.emergencyContactName}
                                            onChange={e => setForm(f => ({ ...f, emergencyContactName: e.target.value }))}
                                            placeholder="Emergency contact name" />
                                    </Field>
                                    <Field label="Contact Phone">
                                        <input className={inputCls} value={form.emergencyContactPhone}
                                            onChange={e => setForm(f => ({ ...f, emergencyContactPhone: e.target.value }))}
                                            placeholder="+91 00000 00000" type="tel" />
                                    </Field>
                                </div>
                            </div>

                            <button type="submit" id="save-profile-btn" disabled={profileSaving}
                                className="w-full py-3 bg-[var(--primary)] text-white font-black rounded-2xl hover:bg-[var(--primary)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {profileSaving ? (
                                    <><div className="w-4 h-4 border-[var(--primary)] border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : '💾 Save Profile'}
                            </button>
                        </form>
                    )}

                    {tab === 'security' && (
                        <form onSubmit={handlePasswordChange} className="bg-white p-8 rounded-3xl shadow-sm border border-[var(--border)] space-y-6">
                            <h3 className="text-lg font-black text-[var(--foreground)]">Change Password</h3>
                            <p className="text-sm text-[var(--muted-foreground)] font-medium">Use a strong password of at least 6 characters.</p>

                            {pwMsg && <SuccessBanner message={pwMsg} onDismiss={() => setPwMsg('')} />}
                            {pwErr && <ErrorBanner message={pwErr} />}

                            {([
                                { key: 'currentPassword', label: 'Current Password', id: 'pw-current', show: showPw.current, toggle: () => setShowPw(s => ({ ...s, current: !s.current })) },
                                { key: 'newPassword', label: 'New Password', id: 'pw-new', show: showPw.new, toggle: () => setShowPw(s => ({ ...s, new: !s.new })) },
                                { key: 'confirmPassword', label: 'Confirm New Password', id: 'pw-confirm', show: showPw.confirm, toggle: () => setShowPw(s => ({ ...s, confirm: !s.confirm })) },
                            ] as any[]).map(field => (
                                <Field key={field.key} label={field.label}>
                                    <div className="relative">
                                        <input
                                            id={field.id}
                                            type={field.show ? 'text' : 'password'}
                                            className={`${inputCls} pr-12`}
                                            value={pwForm[field.key as keyof typeof pwForm]}
                                            onChange={e => setPwForm(f => ({ ...f, [field.key]: e.target.value }))}
                                            placeholder="••••••••"
                                            required
                                        />
                                        <button type="button" onClick={field.toggle}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[var(--primary)] transition-colors p-1">
                                            {field.show ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </Field>
                            ))}

                            <button type="submit" id="change-password-btn" disabled={pwSaving}
                                className="w-full py-3 bg-[var(--primary)] text-white font-black rounded-2xl hover:bg-[var(--primary)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {pwSaving ? (
                                    <><div className="w-4 h-4 border-[var(--primary)] border-white/30 border-t-white rounded-full animate-spin" /> Changing...</>
                                ) : '🔒 Update Password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
