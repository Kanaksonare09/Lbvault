'use client';

import { useState, useEffect } from 'react';
import { doctorService } from '@/services/doctorService';
import { useAuth } from '@/lib/AuthContext';

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialization: '' });
    const [regLoading, setRegLoading] = useState(false);
    const [regError, setRegError] = useState('');

    const { user } = useAuth();

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const data = await doctorService.getDoctors();
            setDoctors(data);
        } catch (err) {
            console.error('Failed to fetch doctors', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc => 
        doc.name.toLowerCase().includes(query.toLowerCase()) || 
        doc.email.toLowerCase().includes(query.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(query.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRegLoading(true);
        setRegError('');
        try {
            await doctorService.createDoctor(formData, user?.id);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', phone: '', specialization: '' });
            fetchDoctors();
        } catch (err: any) {
            setRegError(err.response?.data?.message || 'Failed to create doctor');
        } finally {
            setRegLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-[#1F2933]">Doctor Directory</h1>
                    <p className="text-[#6B7280] mt-1 text-lg font-medium">Manage affiliated physicians and specialists.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>
                    Add New Doctor
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2933]/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-[#1F2933]">Register Doctor</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-[#6B7280] hover:text-[#1F2933] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {regError && (
                                    <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100 flex items-center">
                                        <svg className="mr-2 shrink-0" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        {regError}
                                    </div>
                                )}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#4F6F6F]/10 outline-none transition-all font-medium"
                                        placeholder="Dr. John Doe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-4 py-3 rounded-2xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#4F6F6F]/10 outline-none transition-all font-medium"
                                        placeholder="doctor@example.com"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Phone</label>
                                        <input 
                                            type="text" 
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            className="w-full px-4 py-3 rounded-2xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#4F6F6F]/10 outline-none transition-all font-medium"
                                            placeholder="+1..."
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#4F6F6F] ml-1">Specialty</label>
                                        <input 
                                            type="text" 
                                            value={formData.specialization}
                                            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                                            className="w-full px-4 py-3 rounded-2xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#4F6F6F]/10 outline-none transition-all font-medium"
                                            placeholder="eg. Cardiology"
                                        />
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={regLoading}
                                    className="w-full btn-primary h-14 mt-4 shadow-lg shadow-[#4F6F6F]/20"
                                >
                                    {regLoading ? 'Creating...' : 'Register Doctor'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-sm border border-[#E2E8F0] overflow-hidden">
                <div className="p-6 border-b border-[#E2E8F0] bg-[#F6F7F5]/50">
                    <div className="relative w-full max-w-xl">
                        <input
                            type="text"
                            placeholder="Search doctors by name or specialty..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-[#E2E8F0] focus:ring-4 focus:ring-[#4F6F6F]/10 outline-none transition-all font-medium"
                        />
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F6F6F]" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[#F6F7F5] text-left">
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Doctor Name</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Email</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Specialty</th>
                                <th className="px-8 py-4 text-xs font-bold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E2E8F0]">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
                                    </td>
                                </tr>
                            ) : filteredDoctors.map((doc) => (
                                <tr key={doc._id} className="hover:bg-[#F6F7F5] transition-colors group">
                                    <td className="px-8 py-5 text-sm font-bold text-[#1F2933]">{doc.name}</td>
                                    <td className="px-8 py-5 text-sm text-[#4F6F6F] font-bold">{doc.email}</td>
                                    <td className="px-8 py-5 text-sm">
                                        <span className="bg-[#8FB9A8]/10 text-[#4F6F6F] px-3 py-1 rounded-full text-xs font-black border border-[#8FB9A8]/30">
                                            {doc.specialization || 'General'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button className="bg-[#F6F7F5] text-[#4F6F6F] px-4 py-2 rounded-xl text-xs font-black border border-[#E2E8F0] hover:bg-[#4F6F6F] hover:text-white transition-all active:scale-95">
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredDoctors.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-[#6B7280] font-medium">
                                        No doctors found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
