'use client';

import { useState, useEffect } from 'react';
import { doctorService } from '@/services/doctorService';
import { useAuth } from '@/lib/AuthContext';

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
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

    useEffect(() => { fetchDoctors(); }, []);

    const filteredDoctors = doctors.filter((doc) =>
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
            setRegError(err.response?.data?.message || 'Failed to create doctor.');
        } finally {
            setRegLoading(false);
        }
    };

    // Specialty color map
    const specialtyColor = (s: string) => {
        const map: Record<string, { bg: string; color: string }> = {
            cardiology:   { bg: '#FEE2E2', color: '#991B1B' },
            radiology:    { bg: '#EDE9FE', color: '#5B21B6' },
            pathology:    { bg: '#D1FAE5', color: '#065F46' },
            neurology:    { bg: '#DBEAFE', color: '#1E40AF' },
            general:      { bg: '#F3F4F6', color: '#374151' },
        };
        const key = (s || 'general').toLowerCase();
        return map[key] ?? map['general'];
    };

    return (
        <div className="space-y-5">

            {/* ── Page Header ───────────────────────────────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1
                        className="font-black text-gray-900"
                        style={{ fontSize: '1.55rem', letterSpacing: '-0.025em', lineHeight: 1.1 }}
                    >
                        Doctor Directory
                    </h1>
                    <p className="text-[13px] text-gray-400 mt-1 font-medium">
                        Manage affiliated physicians and specialists.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 text-[12.5px] font-semibold px-4 py-2.5 rounded-lg transition-colors"
                    style={{ background: 'var(--primary)', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
                >
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Doctor
                </button>
            </div>

            {/* ── Main Card ───────────────────────────────── */}
            <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ border: '1px solid #EAEEF2', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
                {/* Search */}
                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #F1F4F7' }}>
                    <div className="relative" style={{ maxWidth: '360px', flex: 1 }}>
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            width="15" height="15" fill="none" viewBox="0 0 24 24"
                            stroke="#9CA3AF" strokeWidth="2.5"
                        >
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search by name, email, or specialty..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-[13px] font-medium text-gray-700 outline-none rounded-xl placeholder:text-gray-400"
                            style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                        />
                    </div>
                    {!loading && (
                        <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full ml-auto shrink-0"
                            style={{ background: '#F4F6F9', color: 'var(--muted-foreground)' }}
                        >
                            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr style={{ borderBottom: '1px solid #F1F4F7' }}>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Doctor</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                <th className="px-6 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Specialty</th>
                                <th className="px-6 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <div
                                            className="w-8 h-8 border-4 rounded-full animate-spin mx-auto"
                                            style={{ borderColor: '#E8EDF2', borderTopColor: 'var(--primary)' }}
                                        />
                                    </td>
                                </tr>
                            ) : filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                                            style={{ background: '#F4F6F9' }}
                                        >
                                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="1.5">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                                <path d="M19 8v6M16 11h6" />
                                            </svg>
                                        </div>
                                        <p className="text-[13px] font-semibold text-gray-700">No doctors found.</p>
                                        <p className="text-[12px] text-gray-400 mt-1">Add a doctor to get started.</p>
                                    </td>
                                </tr>
                            ) : filteredDoctors.map((doc) => {
                                const initials = (doc.name || 'D')
                                    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
                                const { bg, color } = specialtyColor(doc.specialization);
                                return (
                                    <tr
                                        key={doc._id}
                                        className="hover:bg-gray-50 transition-colors"
                                        style={{ borderBottom: '1px solid #F1F4F7' }}
                                    >
                                        {/* Doctor */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                                                    style={{ background: '#4A5568' }}
                                                >
                                                    {initials}
                                                </div>
                                                <p className="text-[13px] font-semibold text-gray-800">Dr. {doc.name}</p>
                                            </div>
                                        </td>
                                        {/* Email */}
                                        <td className="px-6 py-4 text-[13px] text-gray-500 font-medium">{doc.email}</td>
                                        {/* Specialty */}
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-[10px] font-bold px-2.5 py-1 rounded capitalize"
                                                style={{ background: bg, color }}
                                            >
                                                {doc.specialization || 'General'}
                                            </span>
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-75"
                                                style={{
                                                    background: '#F4F6F9',
                                                    color: '#374151',
                                                    border: '1px solid #E8EDF2',
                                                }}
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Register Doctor Modal ────────────────────── */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(17,24,39,0.55)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-2xl overflow-hidden"
                        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div
                            className="flex items-center justify-between px-6 py-5"
                            style={{ borderBottom: '1px solid #F1F4F7' }}
                        >
                            <div>
                                <h2 className="text-[16px] font-black text-gray-900">Register Doctor</h2>
                                <p className="text-[12px] text-gray-400 mt-0.5">Add a new affiliated physician</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal body */}
                        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                            {regError && (
                                <div
                                    className="flex items-center gap-2 text-[12px] font-semibold px-3 py-2.5 rounded-xl"
                                    style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FEE2E2' }}
                                >
                                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {regError}
                                </div>
                            )}

                            {[
                                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Dr. Jane Smith' },
                                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'doctor@clinic.com' },
                            ].map(({ label, key, type, placeholder }) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        required={key !== 'phone'}
                                        value={formData[key as keyof typeof formData]}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        placeholder={placeholder}
                                        className="w-full text-[13px] font-medium text-gray-700 outline-none rounded-xl px-3 py-2.5 placeholder:text-gray-400"
                                        style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                                    />
                                </div>
                            ))}

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: 'Phone', key: 'phone', placeholder: '+1 555 000' },
                                    { label: 'Specialty', key: 'specialization', placeholder: 'e.g. Cardiology' },
                                ].map(({ label, key, placeholder }) => (
                                    <div key={key}>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                            {label}
                                        </label>
                                        <input
                                            type="text"
                                            value={formData[key as keyof typeof formData]}
                                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                            placeholder={placeholder}
                                            className="w-full text-[13px] font-medium text-gray-700 outline-none rounded-xl px-3 py-2.5 placeholder:text-gray-400"
                                            style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 text-[13px] font-semibold py-2.5 rounded-xl transition-colors"
                                    style={{ background: '#F4F6F9', color: 'var(--muted-foreground)' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={regLoading}
                                    className="flex-1 text-[13px] font-semibold py-2.5 rounded-xl transition-all"
                                    style={{
                                        background: regLoading ? '#E5E7EB' : 'var(--primary)',
                                        color: regLoading ? '#9CA3AF' : '#fff',
                                        boxShadow: regLoading ? 'none' : '0 2px 8px rgba(200,168,75,0.3)',
                                    }}
                                >
                                    {regLoading ? 'Creating…' : 'Register Doctor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
