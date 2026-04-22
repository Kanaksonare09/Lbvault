'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import api from '@/services/api';

/* ─── SPECIALTIES ────────────────────────────────────────────── */
const SPECIALTIES = [
    'General Medicine', 'Cardiology', 'Dermatology', 'Endocrinology',
    'Gastroenterology', 'Hematology', 'Nephrology', 'Neurology',
    'Oncology', 'Ophthalmology', 'Orthopedics', 'Pediatrics',
    'Psychiatry', 'Pulmonology', 'Radiology', 'Rheumatology',
    'Surgery (General)', 'Urology', 'Obstetrics & Gynecology', 'Other',
];

/* ─── BANNER HELPERS ──────────────────────────────────────────── */
function SuccessBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-[var(--accent-soft)] border border-[#FDE68A] rounded-2xl animate-in fade-in duration-300">
            <div className="w-7 h-7 bg-[var(--primary)] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
            </div>
            <p className="text-sm font-bold text-[var(--primary)] flex-1">{message}</p>
            <button onClick={onDismiss} className="text-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <div className="w-7 h-7 bg-rose-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <p className="text-sm font-bold text-rose-700">{message}</p>
        </div>
    );
}

/* ─── FIELD WRAPPER ──────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-[10.5px] font-black uppercase tracking-[0.12em] text-[#94A3B8] mb-2">{label}</label>
            {children}
        </div>
    );
}

const INPUT = "w-full px-4 py-3 rounded-xl border border-[var(--border)] text-[13.5px] font-medium text-[#0F172A] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all bg-white placeholder:text-[#CBD5E0]";
const SELECT = INPUT + " appearance-none cursor-pointer";

/* ─── PAGE ───────────────────────────────────────────────────── */
export default function DoctorProfilePage() {
    const { user, refreshUser } = useAuth();

    const [form, setForm] = useState({
        name: '', phone: '', address: '',
        specialty: '', licenseNumber: '', hospitalName: '',
        yearsOfExperience: '', consultationFee: '', bio: '',
    });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileSaving,  setProfileSaving]  = useState(false);
    const [profileMsg,     setProfileMsg]     = useState('');
    const [profileErr,     setProfileErr]     = useState('');

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg,    setPwMsg]    = useState('');
    const [pwErr,    setPwErr]    = useState('');
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    const [tab, setTab] = useState<'profile' | 'security'>('profile');

    /* load */
    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                const u = res.data;
                const p = u.profile || {};
                setForm({
                    name:               u.name || '',
                    phone:              u.phone || '',
                    address:            p.address || '',
                    specialty:          p.specialty || '',
                    licenseNumber:      p.licenseNumber || '',
                    hospitalName:       p.hospitalName || '',
                    yearsOfExperience:  p.yearsOfExperience ? String(p.yearsOfExperience) : '',
                    consultationFee:    p.consultationFee   ? String(p.consultationFee)   : '',
                    bio:                p.bio || '',
                });
            })
            .catch(() => {})
            .finally(() => setProfileLoading(false));
    }, []);

    const setF = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    /* save profile */
    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileSaving(true); setProfileMsg(''); setProfileErr('');
        try {
            await api.put('/auth/profile', form);
            setProfileMsg('Profile updated successfully! ✅');
            await refreshUser?.();
        } catch (err: any) {
            setProfileErr(err?.response?.data?.message || 'Failed to save profile.');
        } finally {
            setProfileSaving(false);
        }
    };

    /* change password */
    const handlePwSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) { setPwErr("Passwords don't match."); return; }
        if (pwForm.newPassword.length < 8) { setPwErr("Password must be at least 8 characters."); return; }
        setPwSaving(true); setPwMsg(''); setPwErr('');
        try {
            await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            setPwMsg('Password changed successfully! 🔒');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setPwErr(err?.response?.data?.message || 'Failed to change password.');
        } finally {
            setPwSaving(false);
        }
    };

    /* avatar initials */
    const initials = (form.name || user?.name || 'D').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

    if (profileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">

            {/* ── Header ────────────────────────────────────────────── */}
            <div>
                <h1 className="text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-1">My Profile</h1>
                <p className="text-[13px] text-[#64748B] font-medium">Manage your professional details and account security.</p>
            </div>

            {/* ── Avatar Card ──────────────────────────────────────── */}
            <div className="bg-white rounded-[24px] border border-[#EEE9DE] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 flex items-center gap-5">
                <div className="w-20 h-20 rounded-[20px] bg-gradient-to-br from-[#1E3A5F] to-[#2D5A8E] flex items-center justify-center text-white text-[26px] font-black shadow-lg shrink-0">
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-[18px] font-black text-[#0F172A] leading-tight">{form.name || 'Doctor'}</h2>
                    <p className="text-[13px] text-[#64748B] font-medium mt-0.5">{form.specialty || 'Specialist'}</p>
                    {form.hospitalName && <p className="text-[11px] text-[#A0AEC0] mt-1">🏥 {form.hospitalName}</p>}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#1E3A5F]/8 rounded-full text-[10px] font-black text-[#1E3A5F] tracking-wide uppercase">
                            Doctor
                        </span>
                        {(user as any)?.isVerified && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#D1FAE5] rounded-full text-[10px] font-black text-[#065F46] tracking-wide uppercase border border-[#A7F3D0]">
                                ✓ Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Tabs ─────────────────────────────────────────────── */}
            <div className="flex gap-2 bg-[#F8F6F0] p-1.5 rounded-2xl">
                {(['profile', 'security'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all capitalize ${
                            tab === t
                                ? 'bg-white text-[#0F172A] shadow-sm'
                                : 'text-[#94A3B8] hover:text-[#64748B]'
                        }`}
                    >
                        {t === 'profile' ? '👤 Professional Info' : '🔒 Password & Security'}
                    </button>
                ))}
            </div>

            {/* ── PROFILE TAB ──────────────────────────────────────── */}
            {tab === 'profile' && (
                <form onSubmit={handleProfileSave} className="space-y-5">
                    {profileMsg && <SuccessBanner message={profileMsg} onDismiss={() => setProfileMsg('')} />}
                    {profileErr && <ErrorBanner message={profileErr} />}

                    {/* Personal */}
                    <div className="bg-white rounded-[24px] border border-[#EEE9DE] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 space-y-5">
                        <h3 className="text-[13px] font-black text-[#1E3A5F] uppercase tracking-[0.1em] pb-3 border-b border-[#F1EDE4]">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Full Name">
                                <input className={INPUT} value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Dr. Arjun Mehta" />
                            </Field>
                            <Field label="Phone Number">
                                <input className={INPUT} type="tel" value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="+91 98765 43210" />
                            </Field>
                        </div>
                        <Field label="Clinic / Hospital Address">
                            <textarea className={INPUT + " resize-none"} rows={2} value={form.address} onChange={e => setF('address', e.target.value)} placeholder="12 Medical Lane, Mumbai, MH 400001" />
                        </Field>
                    </div>

                    {/* Professional */}
                    <div className="bg-white rounded-[24px] border border-[#EEE9DE] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 space-y-5">
                        <h3 className="text-[13px] font-black text-[#1E3A5F] uppercase tracking-[0.1em] pb-3 border-b border-[#F1EDE4]">Professional Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Medical Specialty">
                                <select className={SELECT} value={form.specialty} onChange={e => setF('specialty', e.target.value)}>
                                    <option value="">Select specialty…</option>
                                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field label="Medical License Number">
                                <input className={INPUT} value={form.licenseNumber} onChange={e => setF('licenseNumber', e.target.value)} placeholder="MCI-2024-XXXXX" />
                            </Field>
                            <Field label="Hospital / Clinic Name">
                                <input className={INPUT} value={form.hospitalName} onChange={e => setF('hospitalName', e.target.value)} placeholder="Apollo Hospitals, Mumbai" />
                            </Field>
                            <Field label="Years of Experience">
                                <input className={INPUT} type="number" min="0" max="60" value={form.yearsOfExperience} onChange={e => setF('yearsOfExperience', e.target.value)} placeholder="e.g. 12" />
                            </Field>
                            <Field label="Consultation Fee (₹)">
                                <input className={INPUT} type="number" min="0" value={form.consultationFee} onChange={e => setF('consultationFee', e.target.value)} placeholder="e.g. 800" />
                            </Field>
                        </div>
                        <Field label="Professional Bio">
                            <textarea
                                className={INPUT + " resize-none"}
                                rows={3}
                                value={form.bio}
                                onChange={e => setF('bio', e.target.value)}
                                placeholder="Brief description of your expertise, research interests, or clinical focus…"
                            />
                        </Field>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={profileSaving}
                        className="w-full py-3.5 bg-[#1E3A5F] hover:bg-[#152C4A] active:scale-[0.99] disabled:opacity-60 text-white font-black text-[14px] rounded-2xl transition-all shadow-[0_4px_16px_rgba(30,58,95,0.25)] flex items-center justify-center gap-2"
                    >
                        {profileSaving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                        ) : 'Save Professional Profile'}
                    </button>
                </form>
            )}

            {/* ── SECURITY TAB ─────────────────────────────────────── */}
            {tab === 'security' && (
                <form onSubmit={handlePwSave} className="space-y-5">
                    {pwMsg && <SuccessBanner message={pwMsg} onDismiss={() => setPwMsg('')} />}
                    {pwErr && <ErrorBanner message={pwErr} />}

                    <div className="bg-white rounded-[24px] border border-[#EEE9DE] shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6 space-y-5">
                        <h3 className="text-[13px] font-black text-[#1E3A5F] uppercase tracking-[0.1em] pb-3 border-b border-[#F1EDE4]">Change Password</h3>
                        {(['current', 'new', 'confirm'] as const).map(k => (
                            <Field key={k} label={k === 'current' ? 'Current Password' : k === 'new' ? 'New Password' : 'Confirm New Password'}>
                                <div className="relative">
                                    <input
                                        className={INPUT}
                                        style={{ paddingRight: 44 }}
                                        type={showPw[k] ? 'text' : 'password'}
                                        value={pwForm[k === 'confirm' ? 'confirmPassword' : k === 'new' ? 'newPassword' : 'currentPassword']}
                                        onChange={e => setPwForm(f => ({ ...f, [k === 'confirm' ? 'confirmPassword' : k === 'new' ? 'newPassword' : 'currentPassword']: e.target.value }))}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPw(s => ({ ...s, [k]: !s[k] }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569]">
                                        {showPw[k]
                                            ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                            : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                                    </button>
                                </div>
                            </Field>
                        ))}
                    </div>

                    <div className="bg-[var(--accent-soft)] border border-[#FDE68A] rounded-2xl p-4 flex gap-3">
                        <svg className="text-[var(--primary)] mt-0.5 shrink-0" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p className="text-[12px] font-medium text-[var(--primary)]">Use a strong password that is at least 8 characters and includes a mix of letters, numbers, and symbols.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={pwSaving}
                        className="w-full py-3.5 bg-[#1E3A5F] hover:bg-[#152C4A] active:scale-[0.99] disabled:opacity-60 text-white font-black text-[14px] rounded-2xl transition-all shadow-[0_4px_16px_rgba(30,58,95,0.25)] flex items-center justify-center gap-2"
                    >
                        {pwSaving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</>
                        ) : '🔒 Update Password'}
                    </button>
                </form>
            )}
        </div>
    );
}
