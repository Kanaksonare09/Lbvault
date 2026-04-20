'use client';

import { useState, useEffect } from 'react';
import { doctorService, DoctorProfile } from '@/services/doctorService';
import { useAuth } from '@/lib/AuthContext';

export default function DoctorProfilePage() {
    const { user, refreshUser } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await doctorService.getProfile();
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
            await doctorService.updateProfile(profile);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            await refreshUser(); // Update global auth state (e.g. name in sidebar)
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Context Header */}
            <div>
                <h1 className="text-5xl font-black text-slate-800 tracking-tighter">Account Settings</h1>
                <p className="text-slate-400 font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Professional Identity & Credentials</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Left Drawer: Identity Card */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white rounded-[50px] p-10 shadow-sm border border-slate-50 text-center relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="relative inline-block mb-10">
                                <div className="w-40 h-40 rounded-[50px] bg-[#8FB9A8]/20 flex items-center justify-center text-[#4F6F6F] text-5xl font-black shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    {profile?.name?.split(' ').map((n: any) => n[0]).join('')}
                                </div>
                                <button className="absolute -bottom-3 -right-3 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#4F6F6F] hover:bg-[#4F6F6F] hover:text-white transition-all border border-[#8FB9A8]/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </button>
                            </div>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">{profile?.name}</h2>
                            <p className="text-sm font-bold text-[#4F6F6F] mt-2 uppercase tracking-widest">{profile?.specialty || 'General Practitioner'}</p>
                            
                            <div className="mt-12 space-y-3">
                                 <button className="w-full h-16 flex items-center justify-center px-6 rounded-3xl bg-[#4F6F6F] text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95">
                                    General Details
                                 </button>
                                 <button className="w-full h-16 flex items-center justify-center px-6 rounded-3xl text-slate-400 font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all group">
                                    Clinical History
                                 </button>
                                 <button className="w-full h-16 flex items-center justify-center px-6 rounded-3xl text-slate-400 font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all group">
                                    Security & Auth
                                 </button>
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8FB9A8]/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                    </div>

                    <div className="bg-[#1F2933] rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/10">
                        <div className="relative z-10 flex flex-col gap-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8FB9A8]">System Integration</h4>
                            <p className="text-sm font-medium leading-relaxed">Your professional credentials are <span className="text-amber-300 font-black">Verified & Synchronized</span> with the National Provider Index.</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#8FB9A8]/60">Active Sync: Stable</span>
                            </div>
                        </div>
                         <div className="absolute -bottom-10 -right-10 opacity-10">
                            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v11l9 5 9-5V7l-9-5zm0 18l-7-3.9V8.9l7 3.9 7-3.9v7.2l-7 3.9z"/></svg>
                        </div>
                    </div>
                </div>

                {/* Main View: Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-[50px] shadow-sm border border-slate-50 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Professional Dossier</h2>
                            {profile?.isVerified && (
                                <div className="flex items-center gap-2 bg-[#8FB9A8]/10 px-4 py-2 rounded-full border border-[#8FB9A8]/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    <span className="text-[9px] font-black text-[#4F6F6F] uppercase tracking-widest">Authorized</span>
                                </div>
                            )}
                        </div>
                        
                        <form onSubmit={handleSave} className="p-10 space-y-12">
                            {message.text && (
                                <div className={`p-6 rounded-[32px] text-xs font-black flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-opacity-5 ${
                                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-rose-50 text-rose-600 border border-rose-100 shadow-rose-900/5'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </div>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                {/* Name Input */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Full Identity</label>
                                    <input 
                                        type="text" 
                                        value={profile?.name || ''}
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        className="w-full px-8 py-5 h-16 rounded-3xl bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/5 outline-none transition-all font-bold text-slate-800 text-sm shadow-sm"
                                        placeholder="Dr. John Doe"
                                    />
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Direct Contact</label>
                                    <input 
                                        type="text" 
                                        value={profile?.phone || ''}
                                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        className="w-full px-8 py-5 h-16 rounded-3xl bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/5 outline-none transition-all font-bold text-slate-800 text-sm shadow-sm"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>

                                {/* Specialty */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Clinical Specialty</label>
                                    <input 
                                        type="text" 
                                        value={profile?.specialty || ''}
                                        onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                                        className="w-full px-8 py-5 h-16 rounded-3xl bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/5 outline-none transition-all font-bold text-slate-800 text-sm shadow-sm"
                                        placeholder="Cardiology / Internal Medicine"
                                    />
                                </div>

                                {/* Degree */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Medical Credentials</label>
                                    <input 
                                        type="text" 
                                        value={profile?.degree || ''}
                                        onChange={(e) => setProfile({...profile, degree: e.target.value})}
                                        className="w-full px-8 py-5 h-16 rounded-3xl bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/5 outline-none transition-all font-bold text-slate-800 text-sm shadow-sm"
                                        placeholder="MBBS, MD (Physiology)"
                                    />
                                </div>

                                {/* Hospital */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Primary Affiliation</label>
                                    <input 
                                        type="text" 
                                        value={profile?.hospital || ''}
                                        onChange={(e) => setProfile({...profile, hospital: e.target.value})}
                                        className="w-full px-8 py-5 h-16 rounded-3xl bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/5 outline-none transition-all font-bold text-slate-800 text-sm shadow-sm"
                                        placeholder="HealthScan Clinical Center"
                                    />
                                </div>

                                {/* Registration Number */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Registration Number (Locked)</label>
                                    <div className="w-full px-8 h-16 rounded-3xl bg-[#8FB9A8]/5 flex items-center shadow-inner border border-[#4F6F6F]/10">
                                        <span className="text-sm font-black text-[#4F6F6F] opacity-60 tracking-wider font-mono uppercase">{profile?.registrationNumber || 'LXV-992-04-IN'}</span>
                                        <svg className="ml-auto text-[#4F6F6F]/20" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-4 pt-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Clinical Practice Address</label>
                                <textarea 
                                    rows={3}
                                    value={profile?.address || ''}
                                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                                    className="w-full px-8 py-6 rounded-[32px] bg-slate-50 border-none focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/5 outline-none transition-all font-bold text-slate-800 text-sm shadow-sm resize-none"
                                    placeholder="Full clinic/hospital coordinates..."
                                />
                            </div>

                            <div className="flex justify-end pt-8">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className="h-20 px-16 bg-[#4F6F6F] text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Synchronizing...
                                        </div>
                                    ) : 'Apply Portfolio Updates'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
