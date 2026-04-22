'use client';

import { useState, useEffect } from 'react';
import { pathologyService, PathologyProfile } from '@/services/pathologyService';
import { useAuth } from '@/lib/AuthContext';

export default function PathologyProfilePage() {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await pathologyService.getProfile();
                setProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await pathologyService.updateProfile(profile);
            setMessage({ type: 'success', text: 'Laboratory profile updated successfully!' });
            await refreshUser();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update laboratory profile' });
        } finally {
            setSaving(false);
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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[var(--foreground)]">Lab Settings</h1>
                <p className="text-[var(--muted-foreground)] mt-1 text-lg font-medium">Manage your laboratory credentials and operational details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[var(--border)] text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-full bg-[#1A202C] flex items-center justify-center text-[#FBBF24] text-4xl font-black shadow-xl shadow-[#1A202C]/20 border-4 border-[var(--background)]">
                                {profile?.labName?.split(' ').map((n: any) => n[0]).join('') || 'L'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 p-2.5 bg-[var(--primary)] rounded-xl shadow-lg border-2 border-white text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-[var(--foreground)] break-words">{profile?.labName}</h2>
                        <p className="text-xs font-black text-[var(--primary)] uppercase tracking-widest mt-2 bg-[var(--accent)] px-3 py-1 rounded-full inline-block">
                            {profile?.isVerified ? 'Verified Lab' : 'Pending Verification'}
                        </p>
                        
                        <div className="mt-8 space-y-2 text-left">
                             <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
                                <p className="text-[10px] uppercase font-black text-[var(--muted-foreground)] tracking-tighter">Current Plan</p>
                                <p className="text-sm font-black text-[var(--foreground)] uppercase">{profile?.paymentPlan || 'Standard'} Tier</p>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Form */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-[var(--border)] overflow-hidden">
                        <div className="p-8 border-b border-[var(--border)] bg-[var(--background)]/30 flex items-center justify-between">
                            <h2 className="text-xl font-black text-[var(--foreground)]">Laboratory Information</h2>
                            <span className="text-[10px] font-black bg-[var(--foreground)] text-white px-3 py-1 rounded-full tracking-widest uppercase">ID: {(user as any)?.id?.slice(-6)}</span>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            {message.text && (
                                <div className={`p-4 rounded-2xl text-sm font-black flex items-center ${
                                    message.type === 'success' ? 'bg-[var(--accent)] text-[var(--primary)] border border-[#FDE68A]' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                } animate-in slide-in-from-top-2`}>
                                    <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Lab Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] ml-1">Laboratory Name</label>
                                    <input 
                                        type="text" 
                                        value={profile?.labName || ''}
                                        onChange={(e) => setProfile({...profile, labName: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F4F6F9] border border-transparent focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/15 focus:border-[var(--primary)]/40 outline-none transition-all font-bold text-gray-800"
                                        placeholder="Global Diagnostics Lab"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] ml-1">Contact Number</label>
                                    <input 
                                        type="text" 
                                        value={profile?.phone || ''}
                                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F4F6F9] border border-transparent focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/15 focus:border-[var(--primary)]/40 outline-none transition-all font-bold text-gray-800"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>

                                {/* License Number */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] ml-1">License Number</label>
                                    <input 
                                        type="text" 
                                        value={profile?.licenseNumber || ''}
                                        onChange={(e) => setProfile({...profile, licenseNumber: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F4F6F9] border border-transparent focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/15 focus:border-[var(--primary)]/40 outline-none transition-all font-bold text-gray-800"
                                        placeholder="LAB-123456"
                                    />
                                </div>

                                {/* City */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] ml-1">City / Region</label>
                                    <input 
                                        type="text" 
                                        value={profile?.city || ''}
                                        onChange={(e) => setProfile({...profile, city: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F4F6F9] border border-transparent focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/15 focus:border-[var(--primary)]/40 outline-none transition-all font-bold text-gray-800"
                                        placeholder="Mumbai, Maharashtra"
                                    />
                                </div>
                            </div>

                            {/* Full Address */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] ml-1">Full Facility Address</label>
                                <textarea 
                                    rows={3}
                                    value={profile?.address || ''}
                                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                                    className="w-full px-5 py-4 rounded-2xl bg-[#F4F6F9] border border-transparent focus:bg-white focus:ring-4 focus:ring-[var(--primary)]/15 focus:border-[var(--primary)]/40 outline-none transition-all font-bold text-gray-800 resize-none"
                                    placeholder="Unit 101, Medical Square..."
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="px-12 py-4 rounded-2xl bg-[var(--primary)] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Synchronizing...' : 'Update Facility'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
