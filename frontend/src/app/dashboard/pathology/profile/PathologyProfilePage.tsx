'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { pathologyService, PathologyProfile } from '@/services/pathologyService';
import { useAuth } from '@/lib/AuthContext';

export default function PathologyProfilePage() {
    const { user: authUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [profile, setProfile] = useState<PathologyProfile>({
        name: '',
        email: '',
        phone: '',
        labName: '',
        licenseNumber: '',
        address: '',
        city: '',
        isVerified: false
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const data = await pathologyService.getProfile();
                setProfile(data);
            } catch (error) {
                console.error('Failed to load profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await pathologyService.updateProfile(profile);
            setIsEditing(false);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Failed to update lab profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin mb-4"></div>
                    <p className="text-[#4F6F6F] font-bold tracking-tight">Loading Lab Credentials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center space-x-4">
                    <Link 
                        href="/dashboard/pathology" 
                        className="p-3 bg-white border border-[#E2E8F0] rounded-2xl text-[#4F6F6F] hover:bg-[#F6F7F5] transition-all shadow-sm group/back"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover/back:-translate-x-1 transition-transform"><path d="m15 18-6-6 6-6"/></svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-[#1F2933]">Lab Profile</h1>
                            {profile.isVerified && (
                                <span className="bg-[#4F6F6F] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Verified</span>
                            )}
                        </div>
                        <p className="text-[#6B7280] mt-1 text-lg font-medium">Manage your pathology center's credentials and contact info.</p>
                    </div>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-[#4F6F6F] text-white px-8 py-3 rounded-2xl font-black shadow-lg hover:bg-[#3D5656] transition-all flex items-center justify-center space-x-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span>Edit Details</span>
                    </button>
                )}
            </div>

            <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Lab Identity Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0] text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-[#4F6F6F]"></div>
                        <div className="w-32 h-32 bg-[#F6F7F5] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-md relative group">
                            <span className="text-4xl font-black text-[#4F6F6F] uppercase">{profile.labName?.[0] || 'L'}</span>
                        </div>
                        
                        {isEditing ? (
                            <div className="space-y-3 px-2">
                                <label className="block text-left text-[10px] font-black text-[#6B7280] uppercase tracking-widest mb-1 ml-1">Center Name</label>
                                <input 
                                    className="w-full bg-[#F6F7F5] border-none rounded-2xl p-3 text-center font-black text-[#1F2933] focus:ring-2 focus:ring-[#8FB9A8]"
                                    value={profile.labName}
                                    onChange={e => setProfile({...profile, labName: e.target.value})}
                                />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-black text-[#1F2933]">{profile.labName}</h2>
                                <p className="text-[#4F6F6F] font-bold uppercase tracking-widest text-[10px] mt-2 bg-[#4F6F6F]/5 py-1 px-4 rounded-full inline-block border border-[#4F6F6F]/10">Pathology Center</p>
                            </>
                        )}

                        <div className="mt-8 pt-8 border-t border-[#F6F7F5] text-left">
                            <div className="space-y-6 p-2">
                                <div>
                                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider mb-1">Registered ID</p>
                                    <p className="text-sm font-black text-[#1F2933] opacity-60">ADMIN-{authUser?.lvId || 'NVL'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-wider mb-1">Plan Level</p>
                                    <p className="text-sm font-black text-[#4F6F6F] uppercase">{profile.paymentPlan || 'Standard Provider'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Operational Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0]">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-[#1F2933]">Laboratory Credentials</h3>
                            {isEditing && (
                                <div className="flex items-center space-x-3">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="text-[#6B7280] font-bold text-sm hover:text-red-500 transition-colors"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={saving}
                                        className={`bg-[#4F6F6F] text-white px-6 py-2 rounded-xl text-sm font-black shadow-md hover:bg-[#3D5656] transition-all ${saving ? 'opacity-50' : ''}`}
                                    >
                                        {saving ? 'Syncing...' : 'Update Profile'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">License Number</p>
                                {isEditing ? (
                                    <input 
                                        className="w-full bg-[#F6F7F5] border-none rounded-2xl p-4 font-bold text-[#1F2933]"
                                        value={profile.licenseNumber}
                                        onChange={e => setProfile({...profile, licenseNumber: e.target.value})}
                                    />
                                ) : (
                                    <p className="font-bold text-[#1F2933]">{profile.licenseNumber || 'Not provided'}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Admin Email</p>
                                <p className="font-bold text-[#1F2933] opacity-60">{profile.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Contact Phone</p>
                                {isEditing ? (
                                    <input 
                                        className="w-full bg-[#F6F7F5] border-none rounded-2xl p-4 font-bold text-[#1F2933]"
                                        value={profile.phone}
                                        onChange={e => setProfile({...profile, phone: e.target.value})}
                                    />
                                ) : (
                                    <p className="font-bold text-[#1F2933]">{profile.phone || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Primary City</p>
                                {isEditing ? (
                                    <input 
                                        className="w-full bg-[#F6F7F5] border-none rounded-2xl p-4 font-bold text-[#1F2933]"
                                        value={profile.city}
                                        onChange={e => setProfile({...profile, city: e.target.value})}
                                    />
                                ) : (
                                    <p className="font-bold text-[#4F6F6F] italic">{profile.city || 'Not specified'}</p>
                                )}
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-[10px] font-black text-[#6B7280] uppercase tracking-[0.2em] mb-2">Lab Facility Address</p>
                                {isEditing ? (
                                    <textarea 
                                        rows={3}
                                        className="w-full bg-[#F6F7F5] border-none rounded-2xl p-4 font-bold text-[#1F2933] resize-none"
                                        value={profile.address}
                                        onChange={e => setProfile({...profile, address: e.target.value})}
                                    />
                                ) : (
                                    <p className="font-bold text-[#1F2933] leading-relaxed">{profile.address || 'Address not listed'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
