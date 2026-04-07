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
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchAccessList();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 1 && !selectedDoctor) {
                performSearch();
            } else if (searchQuery.length <= 1) {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, selectedDoctor]);

    const performSearch = async () => {
        try {
            setIsSearching(true);
            const doctors = await patientService.searchDoctors(searchQuery);
            setSearchResults(doctors);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchAccessList = async () => {
        try {
            const data = await patientService.getAccessList();
            setAccessList(data);
        } catch (err) {
            console.error('Failed to fetch access list', err);
        }
    };

    const handleGrant = async (e: React.FormEvent) => {
        e.preventDefault();

        const docId = selectedDoctor?._id;
        console.log("doctorId being sent:", docId);

        // Validation: Ensure we have a valid 24-character hex ID
        if (!docId || !/^[0-9a-fA-F]{24}$/.test(docId)) {
            setMessage({ type: 'error', text: 'Please select a valid doctor from the search results.' });
            return;
        }

        try {
            setLoading(true);
            await patientService.grantAccess(docId);
            setMessage({ type: 'success', text: `Access granted to Dr. ${selectedDoctor.name}!` });
            setSearchQuery('');
            setSelectedDoctor(null);
            fetchAccessList();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to grant access. This doctor may already have access.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const handleRevoke = async (docId: string, reportId: string | null = null) => {
        try {
            setLoading(true);
            await patientService.revokeAccess(docId, reportId);
            setMessage({ type: 'success', text: 'Access revoked successfully!' });
            fetchAccessList();
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to revoke access.' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-[#E2E8F0] space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#1F2933]">Manage Doctor Access</h2>
                <div className="bg-[#8FB9A8]/10 px-4 py-1 rounded-full border border-[#8FB9A8]/20">
                    <span className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest">Secure Ownership</span>
                </div>
            </div>

            {/* Grant Access Form */}
            <div className="relative">
                <form onSubmit={handleGrant} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search Doctor by Name or Email..."
                            className="w-full px-6 py-3 rounded-2xl border border-[#E2E8F0] bg-[#F6F7F5] outline-none font-bold text-[#1F2933] focus:border-[#8FB9A8] transition-all"
                            value={selectedDoctor ? `Dr. ${selectedDoctor.name}` : searchQuery}
                            onChange={(e) => {
                                if (selectedDoctor) setSelectedDoctor(null);
                                setSearchQuery(e.target.value);
                            }}
                            disabled={loading}
                        />
                        {isSearching && (
                            <div className="absolute right-4 top-3.5">
                                <div className="w-5 h-5 border-2 border-[#8FB9A8] border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="px-8 py-3 bg-[#4F6F6F] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1F2933] transition-all active:scale-95 disabled:opacity-50 shadow-md"
                        disabled={loading || !selectedDoctor}
                    >
                        {loading ? 'Processing...' : 'Grant Access'}
                    </button>
                </form>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && !selectedDoctor && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-[#E2E8F0] rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {searchResults.map((doc, index) => (
                            <button
                                key={doc._id || index}
                                onClick={() => {
                                    setSelectedDoctor(doc);
                                    setSearchResults([]);
                                }}
                                className="w-full px-6 py-4 text-left hover:bg-[#F6F7F5] border-b border-[#E2E8F0] last:border-0 flex items-center justify-between group transition-all"
                            >
                                <div>
                                    <p className="font-black text-[#1F2933]">Dr. {doc.name}</p>
                                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{doc.specialty} • {doc.hospitalName}</p>
                                </div>
                                <span className="text-[10px] font-black text-[#8FB9A8] opacity-0 group-hover:opacity-100 transition-all uppercase">Select</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* No Results Fallback */}
                {searchQuery.length > 2 && searchResults.length === 0 && !selectedDoctor && !isSearching && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-[#E2E8F0] rounded-3xl shadow-xl p-8 text-center animate-in fade-in slide-in-from-top-2 duration-200 border-dashed">
                        <div className="w-12 h-12 bg-[#F6F7F5] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#94A3B8]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <p className="text-[#1F2933] font-black text-sm uppercase tracking-tight">No Approved Doctors Found</p>
                        <p className="text-[10px] text-[#6B7280] font-medium mt-2 max-w-[200px] mx-auto leading-relaxed">
                            Ensure the doctor is registered and has been verified by an admin.
                        </p>
                    </div>
                )}
            </div>

            {message && (
                <div className={`p-4 rounded-2xl text-xs font-bold animate-in zoom-in duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    <div className="flex items-center gap-2">
                        {message.type === 'success' ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 m 0 0l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        {message.text}
                    </div>
                </div>
            )}

            {/* List of Authorsized Doctors */}
            <div className="space-y-4">
                <h3 className="text-sm font-black text-[#6B7280] uppercase tracking-widest">Authorized Healthcare Providers</h3>

                {accessList.length === 0 ? (
                    <div className="bg-[#F6F7F5] p-10 rounded-3xl border border-dashed border-[#E2E8F0] text-center">
                        <p className="text-[#6B7280] font-bold text-sm">No doctors currently have access.</p>
                        <p className="text-[10px] text-[#94A3B8] mt-1 italic tracking-tight">You are the sole owner of your medical records.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {accessList.map((access, index) => (
                            <div key={access._id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-[#F6F7F5] rounded-3xl border border-[#E2E8F0] group hover:border-[#8FB9A8] transition-all">
                                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-[#4F6F6F] border border-[#E2E8F0] group-hover:bg-[#8FB9A8] group-hover:text-white transition-all shadow-sm">
                                        {access?.doctorId?.name?.[0] || "?"}
                                    </div>
                                    <div>
                                        <p className="font-black text-[#1F2933]">Dr. {access?.doctorId?.name || "Unknown Doctor"}</p>
                                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">
                                            {access.reportId ? `Report: ${access.reportId.reportName}` : 'Global Access (All Reports)'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevoke(access.doctorId._id, access.reportId?._id)}
                                    className="px-6 py-2 bg-white border border-[#E2E8F0] text-rose-600 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 shadow-sm"
                                    disabled={loading}
                                >
                                    Revoke Access
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
