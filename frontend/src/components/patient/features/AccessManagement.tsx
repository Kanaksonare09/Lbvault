'use client';

import React, { useState, useEffect } from 'react';
import { patientService } from '@/services/patientService';

export default function AccessManagement() {
    const [accessList, setAccessList] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [showGrantForm, setShowGrantForm] = useState(false);

    useEffect(() => { fetchAccessList(); }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            if (searchQuery.length > 1 && !selectedDoctor) performSearch();
            else if (searchQuery.length <= 1) setSearchResults([]);
        }, 300);
        return () => clearTimeout(t);
    }, [searchQuery, selectedDoctor]);

    const performSearch = async () => {
        try {
            setIsSearching(true);
            const doctors = await patientService.searchDoctors(searchQuery);
            setSearchResults(doctors);
        } catch { /* silent */ }
        finally { setIsSearching(false); }
    };

    const fetchAccessList = async () => {
        try { const data = await patientService.getAccessList(); setAccessList(data); }
        catch (err) { console.error('Failed to fetch access list', err); }
    };

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();
        const docId = selectedDoctor?._id;
        if (!docId || !/^[0-9a-fA-F]{24}$/.test(docId)) {
            setMessage({ type: 'error', text: 'Please select a valid doctor.' });
            return;
        }
        try {
            setLoading(true);
            await patientService.grantAccess(docId);
            setMessage({ type: 'success', text: `Access granted to Dr. ${selectedDoctor.name}!` });
            setSearchQuery(''); setSelectedDoctor(null); fetchAccessList();
            setTimeout(() => setShowGrantForm(false), 1200);
        } catch {
            setMessage({ type: 'error', text: 'Failed to grant access.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3500);
        }
    };

    const handleRevoke = async (docId: string, reportId: string | null = null) => {
        try {
            setLoading(true);
            await patientService.revokeAccess(docId, reportId);
            fetchAccessList();
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    return (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 w-full">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-bold text-gray-800">Provider Access</span>
                <svg width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
            </div>

            {/* Feedback */}
            {message && (
                <div className={`mb-3 px-3 py-2 rounded-xl text-[11px] font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {message.text}
                </div>
            )}

            {/* Access List */}
            {!showGrantForm ? (
                <>
                    <div className="space-y-3">
                        {accessList.length === 0 ? (
                            <p className="text-[12px] text-gray-400 text-center py-2">No providers have access yet.</p>
                        ) : (
                            accessList.map((access, i) => (
                                <div key={access._id || i} className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                        <span className="text-[12px] font-bold text-gray-600">
                                            {access?.doctorId?.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-gray-800 leading-tight truncate">
                                            Dr. {access?.doctorId?.name || 'Unknown'}
                                        </p>
                                        <p className="text-[10px] text-gray-400 leading-tight truncate">
                                            {access?.doctorId?.specialty || (access.reportId ? 'Report Access' : 'Global Access')}
                                        </p>
                                    </div>
                                    {/* Revoke */}
                                    <button
                                        onClick={() => handleRevoke(access.doctorId._id, access.reportId?._id)}
                                        disabled={loading}
                                        className="shrink-0 text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors disabled:opacity-40 border border-red-200 rounded-full px-2.5 py-1 hover:bg-red-50"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Grant New Access Link */}
                    <button
                        onClick={() => setShowGrantForm(true)}
                        className="mt-4 w-full text-center text-[12px] font-bold text-[var(--primary)] hover:text-blue-700 transition-colors"
                    >
                        + Grant New Access
                    </button>
                </>
            ) : (
                /* Grant Form */
                <form onSubmit={handleGrant} className="flex flex-col gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search doctor by name..."
                            value={selectedDoctor ? `Dr. ${selectedDoctor.name}` : searchQuery}
                            onChange={e => { if (selectedDoctor) setSelectedDoctor(null); setSearchQuery(e.target.value); }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[12px] text-gray-800 outline-none focus:border-blue-300 transition-colors"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-2.5 w-4 h-4 border-2 border-[var(--accent)] border-t-[var(--primary)] rounded-full animate-spin" />
                        )}
                    </div>

                    {/* Dropdown */}
                    {searchResults.length > 0 && !selectedDoctor && (
                        <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-lg">
                            {searchResults.map(doc => (
                                <button key={doc._id} type="button"
                                    onClick={() => { setSelectedDoctor(doc); setSearchResults([]); }}
                                    className="w-full px-3 py-2.5 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 flex justify-between items-center">
                                    <div>
                                        <p className="text-[12px] font-bold text-gray-800">Dr. {doc.name}</p>
                                        <p className="text-[10px] text-gray-400">{doc.specialty}</p>
                                    </div>
                                    <span className="text-[10px] font-bold text-[var(--primary)]">Select</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button type="button" onClick={() => { setShowGrantForm(false); setSearchQuery(''); setSelectedDoctor(null); }}
                            className="flex-1 py-2 text-[12px] font-semibold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={!selectedDoctor || loading}
                            className="flex-1 py-2 text-[12px] font-bold text-white bg-[var(--primary)] rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                            {loading ? 'Granting...' : 'Grant'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
