'use client';

import React, { useState, useEffect } from 'react';
import { pathologyService, PathologyProfile } from '@/services/pathologyService';
import { useAuth } from '@/lib/AuthContext';

// ─── Field row component ──────────────────────────────────────────────────────
function ProfileField({
    label,
    value,
    editing,
    children,
}: {
    label: string;
    value?: string;
    editing: boolean;
    children?: React.ReactNode;
}) {
    return (
        <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
            {editing && children ? (
                children
            ) : (
                <p className="text-[13.5px] font-semibold text-gray-800">{value || <span className="text-gray-300">Not set</span>}</p>
            )}
        </div>
    );
}

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls = "w-full text-[13px] font-medium text-gray-700 outline-none rounded-xl px-3 py-2.5 placeholder:text-gray-400";
const inputStyle = { background: '#F4F6F9', border: '1px solid #E8EDF2' };

export default function PathologyProfilePage() {
    const { user: authUser, refreshUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);

    const [profile, setProfile] = useState<PathologyProfile>({
        name: '',
        email: '',
        phone: '',
        labName: '',
        licenseNumber: '',
        address: '',
        city: '',
        isVerified: false,
    });

    useEffect(() => {
        pathologyService.getProfile()
            .then(setProfile)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await pathologyService.updateProfile(profile);
            await refreshUser();
            setIsEditing(false);
            setSavedOk(true);
            setTimeout(() => setSavedOk(false), 3000);
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div
                    className="w-9 h-9 border-4 rounded-full animate-spin"
                    style={{ borderColor: '#E8EDF2', borderTopColor: 'var(--primary)' }}
                />
            </div>
        );
    }

    const initials = (profile.labName || profile.name || 'L')
        .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className="space-y-5 pb-10">

            {/* ── Page Header ─────────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1
                            className="font-black text-gray-900"
                            style={{ fontSize: '1.55rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}
                        >
                            Lab Profile
                        </h1>
                        {profile.isVerified && (
                            <span
                                className="text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
                                style={{ background: 'var(--accent)', color: 'var(--primary)' }}
                            >
                                ✓ Verified
                            </span>
                        )}
                    </div>
                    <p className="text-[13px] text-gray-400 mt-1 font-medium">
                        Manage your pathology center's credentials and contact info.
                    </p>
                </div>

                {/* Save / Edit toggle */}
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                        style={{ background: 'var(--primary)', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                    >
                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Details
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                            style={{ background: '#F4F6F9', color: 'var(--muted-foreground)' }}
                        >
                            Discard
                        </button>
                        <button
                            form="profile-form"
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                            style={{
                                background: saving ? '#E5E7EB' : 'var(--primary)',
                                color: saving ? '#9CA3AF' : '#fff',
                            }}
                        >
                            {saving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Success banner ───────────────────────────────── */}
            {savedOk && (
                <div
                    className="flex items-center gap-2 text-[12px] font-semibold px-4 py-2.5 rounded-xl"
                    style={{ background: 'var(--accent)', color: 'var(--primary)', border: '1px solid #FDE68A' }}
                >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Profile updated successfully.
                </div>
            )}

            <form id="profile-form" onSubmit={handleUpdate}>
                <div className="grid grid-cols-3 gap-4">

                    {/* ── Left: Lab Identity Card ─────────────────── */}
                    <div className="space-y-4">
                        {/* Avatar card */}
                        <div
                            className="bg-white rounded-2xl p-6 flex flex-col items-center text-center"
                            style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                        >
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white mb-4"
                                style={{ background: 'var(--primary)' }}
                            >
                                {initials}
                            </div>

                            {isEditing ? (
                                <div className="w-full text-left">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                        Lab Name
                                    </label>
                                    <input
                                        className={inputCls}
                                        style={inputStyle}
                                        value={profile.labName}
                                        onChange={(e) => setProfile({ ...profile, labName: e.target.value })}
                                        placeholder="e.g. Kanak Diagnostics"
                                    />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-[16px] font-black text-gray-900">{profile.labName || 'Lab Name'}</h2>
                                    <span
                                        className="text-[9px] font-bold px-3 py-1 rounded-full mt-2 uppercase tracking-widest"
                                        style={{ background: 'var(--accent)', color: 'var(--primary)' }}
                                    >
                                        Pathology Center
                                    </span>
                                </>
                            )}
                        </div>

                        {/* IDs card */}
                        <div
                            className="bg-white rounded-2xl p-5 space-y-4"
                            style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                        >
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registered ID</p>
                                <p className="text-[13px] font-semibold text-gray-600">
                                    {(authUser as any)?.lvId ? `LV-${(authUser as any).lvId}` : 'Not assigned'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Plan</p>
                                <p className="text-[13px] font-semibold text-gray-600 capitalize">
                                    {profile.paymentPlan || 'Standard'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                                <span
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                                    style={
                                        profile.isVerified
                                            ? { background: 'var(--accent)', color: 'var(--primary)' }
                                            : { background: '#F4F6F9', color: 'var(--muted-foreground)' }
                                    }
                                >
                                    {profile.isVerified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Right: Operational Details ────────────────── */}
                    <div className="col-span-2 space-y-4">

                        {/* Contact Info card */}
                        <div
                            className="bg-white rounded-2xl p-6"
                            style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                        >
                            <h3
                                className="font-black text-gray-900 mb-5"
                                style={{ fontSize: '14px' }}
                            >
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <ProfileField label="Admin Name" value={profile.name} editing={isEditing}>
                                    <input
                                        className={inputCls}
                                        style={inputStyle}
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        placeholder="Full name"
                                    />
                                </ProfileField>

                                <ProfileField label="Email Address" value={profile.email} editing={false} />

                                <ProfileField label="Phone Number" value={profile.phone} editing={isEditing}>
                                    <input
                                        className={inputCls}
                                        style={inputStyle}
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        placeholder="+1 555 000 0000"
                                    />
                                </ProfileField>

                                <ProfileField label="City" value={profile.city} editing={isEditing}>
                                    <input
                                        className={inputCls}
                                        style={inputStyle}
                                        value={profile.city}
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                        placeholder="e.g. Mumbai"
                                    />
                                </ProfileField>
                            </div>
                        </div>

                        {/* Lab Credentials card */}
                        <div
                            className="bg-white rounded-2xl p-6"
                            style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                        >
                            <h3
                                className="font-black text-gray-900 mb-5"
                                style={{ fontSize: '14px' }}
                            >
                                Laboratory Credentials
                            </h3>
                            <div className="grid grid-cols-2 gap-5">
                                <ProfileField label="License Number" value={profile.licenseNumber} editing={isEditing}>
                                    <input
                                        className={inputCls}
                                        style={inputStyle}
                                        value={profile.licenseNumber}
                                        onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                                        placeholder="e.g. LIC-2024-00123"
                                    />
                                </ProfileField>

                                <ProfileField label="Lab Facility Address" value={profile.address} editing={isEditing}>
                                    <input
                                        className={inputCls}
                                        style={inputStyle}
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        placeholder="Street address"
                                    />
                                </ProfileField>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
