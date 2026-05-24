'use client';

import React, { useState } from 'react';

interface PatientSharingModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportName: string;
}

export default function PatientSharingModal({ isOpen, onClose, reportName }: PatientSharingModalProps) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleShare = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSharing(true);
        // Mock API call
        setTimeout(() => {
            setIsSharing(false);
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                setIsSuccess(false);
                setEmail('');
                setMessage('');
            }, 2000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-[var(--foreground)]/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="bg-[var(--background)] p-8 border-b border-[var(--border)] flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Share Report</h2>
                        <p className="text-sm font-bold text-[var(--primary)] mt-1 uppercase tracking-widest">{reportName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-[var(--muted-foreground)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                </div>

                <div className="p-8">
                    {isSuccess ? (
                        <div className="text-center py-12 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                            <h3 className="text-xl font-black text-[var(--foreground)]">Success!</h3>
                            <p className="text-[var(--muted-foreground)] font-bold">Your report has been shared with the doctor.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleShare} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2 ml-1">Doctor's Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter clinic or doctor email..."
                                    className="w-full px-6 py-4 bg-[var(--background)] border-transparent rounded-2xl outline-none focus:bg-white focus:border-[var(--secondary)] border-2 transition-all font-bold text-sm text-[var(--foreground)]"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-[var(--muted-foreground)] uppercase tracking-widest mb-2 ml-1">Optional Message</label>
                                <textarea
                                    rows={4}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Add any specific concerns or questions for the doctor..."
                                    className="w-full px-6 py-4 bg-[var(--background)] border-transparent rounded-2xl outline-none focus:bg-white focus:border-[var(--secondary)] border-2 transition-all font-bold text-sm text-[var(--foreground)] resize-none"
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSharing}
                                className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-[var(--foreground)] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                            >
                                {isSharing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        <span>Sharing...</span>
                                    </>
                                ) : (
                                    <span>Share with Doctor</span>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
