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
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-[#1F2933]">Profile Settings</h1>
                <p className="text-[#6B7280] mt-1 text-lg font-medium">Manage your professional identity and clinical credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Sidebar: Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#E2E8F0] text-center">
                        <div className="relative inline-block mb-6">
                            <div className="w-32 h-32 rounded-full bg-[#4F6F6F] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-[#4F6F6F]/20">
                                {profile?.name?.split(' ').map((n: any) => n[0]).join('')}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-[#E2E8F0] text-[#4F6F6F] hover:bg-[#F6F7F5] transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                            </button>
                        </div>
                        <h2 className="text-xl font-black text-[#1F2933]">{profile?.name}</h2>
                        <p className="text-sm font-bold text-[#8FB9A8] mt-1">{profile?.email}</p>
                        
                        <div className="mt-8 space-y-2">
                             <button className="w-full flex items-center px-4 py-3 rounded-2xl bg-[#4F6F6F] text-white font-black text-sm transition-all shadow-lg shadow-[#4F6F6F]/20">
                                <svg className="mr-3" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                Edit Profile
                             </button>
                             <button className="w-full flex items-center px-4 py-3 rounded-2xl text-[#6B7280] font-black text-sm hover:bg-[#F6F7F5] transition-all group">
                                <svg className="mr-3 text-[#E2E8F0] group-hover:text-[#4F6F6F] transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Security
                             </button>
                        </div>
                    </div>
                </div>

                {/* Main Content: Form */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#E2E8F0] overflow-hidden">
                        <div className="p-8 border-b border-[#E2E8F0] bg-[#F6F7F5]/30">
                            <h2 className="text-xl font-black text-[#1F2933]">Professional Information</h2>
                        </div>
                        
                        <form onSubmit={handleSave} className="p-8 space-y-8">
                            {message.text && (
                                <div className={`p-4 rounded-2xl text-sm font-black flex items-center ${
                                    message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                                } animate-in slide-in-from-top-2`}>
                                    <svg className="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Input */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={profile?.name || ''}
                                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F6F7F5] border-transparent focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/10 focus:border-[#4F6F6F]/30 outline-none transition-all font-bold text-[#1F2933]"
                                        placeholder="Dr. John Doe"
                                    />
                                </div>

                                {/* Phone Input */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Mobile Number</label>
                                    <input 
                                        type="text" 
                                        value={profile?.phone || ''}
                                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F6F7F5] border-transparent focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/10 focus:border-[#4F6F6F]/30 outline-none transition-all font-bold text-[#1F2933]"
                                        placeholder="+91 00000 00000"
                                    />
                                </div>

                                {/* Specialty */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Medical Specialty</label>
                                    <input 
                                        type="text" 
                                        value={profile?.specialty || ''}
                                        onChange={(e) => setProfile({...profile, specialty: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F6F7F5] border-transparent focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/10 focus:border-[#4F6F6F]/30 outline-none transition-all font-bold text-[#1F2933]"
                                        placeholder="eg. Oncology"
                                    />
                                </div>

                                {/* Degree */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Academic Degree</label>
                                    <input 
                                        type="text" 
                                        value={profile?.degree || ''}
                                        onChange={(e) => setProfile({...profile, degree: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F6F7F5] border-transparent focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/10 focus:border-[#4F6F6F]/30 outline-none transition-all font-bold text-[#1F2933]"
                                        placeholder="eg. MBBS, MD"
                                    />
                                </div>

                                {/* Hospital */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Affiliated Hospital</label>
                                    <input 
                                        type="text" 
                                        value={profile?.hospital || ''}
                                        onChange={(e) => setProfile({...profile, hospital: e.target.value})}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#F6F7F5] border-transparent focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/10 focus:border-[#4F6F6F]/30 outline-none transition-all font-bold text-[#1F2933]"
                                        placeholder="City General Hospital"
                                    />
                                </div>

                                {/* Registration Number */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Reg. Number (Uneditable)</label>
                                    <input 
                                        type="text" 
                                        disabled
                                        value={profile?.registrationNumber || ''}
                                        className="w-full px-5 py-4 rounded-2xl bg-[#E2E8F0]/30 border-transparent outline-none font-bold text-[#6B7280] cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Clinic/Hospital Address</label>
                                <textarea 
                                    rows={3}
                                    value={profile?.address || ''}
                                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                                    className="w-full px-5 py-4 rounded-2xl bg-[#F6F7F5] border-transparent focus:bg-white focus:ring-4 focus:ring-[#4F6F6F]/10 focus:border-[#4F6F6F]/30 outline-none transition-all font-bold text-[#1F2933] resize-none"
                                    placeholder="Full address of your primary clinic..."
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button 
                                    type="submit" 
                                    disabled={saving}
                                    className={`btn-primary h-14 px-12 shadow-xl shadow-[#4F6F6F]/20 disabled:opacity-50 transition-all`}
                                >
                                    {saving ? (
                                        <div className="flex items-center">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                            Saving...
                                        </div>
                                    ) : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
