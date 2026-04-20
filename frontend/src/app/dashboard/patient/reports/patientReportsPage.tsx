'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { reportService } from '@/services/reportService';
import api from '@/services/api';

/* ─────────────────────────────────────────────────────────────────────────── */
/* VOICE TOGGLE BUTTON                                                         */
/* Two pills: EN | HI — clicking one generates & plays audio in that language  */
/* ─────────────────────────────────────────────────────────────────────────── */
function VoiceToggle({ reportId }: { reportId: string }) {
    const [activeLang, setActiveLang]   = useState<'English' | 'Hindi' | null>(null);
    const [status, setStatus]           = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
    const [errorMsg, setErrorMsg]       = useState('');
    const audioRef                      = useRef<HTMLAudioElement | null>(null);
    const blobUrlRef                    = useRef<string | null>(null);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            audioRef.current?.pause();
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        };
    }, []);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setStatus('idle');
        setActiveLang(null);
    };

    const handleLang = async (lang: 'English' | 'Hindi') => {
        // If same lang is already playing → stop it
        if (activeLang === lang && (status === 'playing' || status === 'paused')) {
            stopAudio();
            return;
        }

        // Stop any current audio
        stopAudio();

        setActiveLang(lang);
        setStatus('loading');
        setErrorMsg('');

        try {
            const res = await reportService.getVoiceAudio(reportId, lang);
            const responseData = res && typeof res === 'object' ? res : {};
            const audioPath: string = responseData.audioUrl || '';

            if (!audioPath) throw new Error('No audio URL returned from server.');

            // Audio files are served by the main Node.js backend (port 5000)
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const fullUrl = audioPath.startsWith('http')
                ? audioPath
                : `${apiBase}${audioPath}`;

            const audioResponse = await fetch(fullUrl);
            if (!audioResponse.ok) throw new Error(`Audio fetch failed: ${audioResponse.status}`);

            const audioBlob = await audioResponse.blob();
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
            const localUrl = URL.createObjectURL(audioBlob);
            blobUrlRef.current = localUrl;

            const audio = new Audio(localUrl);
            audioRef.current = audio;

            audio.addEventListener('ended', () => { setStatus('idle'); setActiveLang(null); });
            audio.addEventListener('error', () => { setStatus('error'); setErrorMsg('Playback failed.'); });

            setStatus('playing');
            await audio.play();
        } catch (err: any) {
            // Extract a user-friendly message from the error
            const raw = err?.response?.data?.message || err?.message || '';
            const msg = raw.includes('No summary')
                ? 'AI summary not ready yet. Check back after analysis.'
                : raw || 'Voice generation failed';
            setErrorMsg(msg);
            setStatus('error');
            setActiveLang(null);
        }
    };

    const isLoading = status === 'loading';

    return (
        <div className="flex flex-col gap-1">
            <p className="text-[8px] font-black text-[#A0AEC0] tracking-[0.14em] uppercase mb-1.5">
                AI Voice Summary
            </p>
            <div className="flex items-center gap-1.5">
                {(['English', 'Hindi'] as const).map((lang) => {
                    const label      = lang === 'English' ? 'EN' : 'HI';
                    const isThisLang = activeLang === lang;
                    const isPlaying  = isThisLang && status === 'playing';
                    const isLoadThis = isThisLang && isLoading;

                    return (
                        <button
                            key={lang}
                            onClick={() => handleLang(lang)}
                            disabled={isLoading && !isThisLang}
                            title={`Play AI summary in ${lang}`}
                            className={`
                                inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full
                                text-[9px] font-black border transition-all
                                ${isPlaying
                                    ? 'bg-[#1E3A5F] border-[#1E3A5F] text-white shadow-sm'
                                    : isLoadThis
                                        ? 'bg-[#EEF2FF] border-[#C7D2FE] text-[#4338CA]'
                                        : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:border-[#94A3B8] hover:bg-white'
                                }
                                disabled:opacity-40 disabled:cursor-not-allowed
                            `}
                        >
                            {isLoadThis ? (
                                <svg className="animate-spin" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                                </svg>
                            ) : isPlaying ? (
                                /* animated bars when playing */
                                <span className="flex items-end gap-[2px] h-3">
                                    <span className="w-[2.5px] bg-white rounded-full animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '40%', animationDelay: '0ms' }} />
                                    <span className="w-[2.5px] bg-white rounded-full animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '90%', animationDelay: '150ms' }} />
                                    <span className="w-[2.5px] bg-white rounded-full animate-[bounce_0.7s_ease-in-out_infinite]" style={{ height: '60%', animationDelay: '300ms' }} />
                                </span>
                            ) : (
                                <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24">
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                            )}
                            {label}
                        </button>
                    );
                })}

                {/* Stop button — only visible when playing */}
                {(status === 'playing' || status === 'paused') && (
                    <button
                        onClick={stopAudio}
                        title="Stop"
                        className="w-6 h-6 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[#F43F5E] flex items-center justify-center hover:bg-[#FFE4E6] transition-colors"
                    >
                        <svg width="7" height="7" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="6" y="6" width="12" height="12" rx="1"/>
                        </svg>
                    </button>
                )}
            </div>

            {/* Error message */}
            {status === 'error' && errorMsg && (
                <p className="text-[9px] text-rose-500 font-medium mt-0.5 max-w-[110px] leading-tight">{errorMsg}</p>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* CATEGORY ICON CONFIG                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
type CatKey = 'Blood Test' | 'Hormone Test' | 'Urine Test' | 'Imaging' | 'Other' | 'default';

const CAT: Record<CatKey, { label: string; bg: string; color: string; keywords: string[]; icon: React.ReactNode }> = {
    'Blood Test': {
        label: 'HEMATOLOGY', bg: 'bg-[#FEF3C7]', color: '#D97706',
        keywords: ['blood', 'hematol', 'cbc', 'haemato', 'hemo', 'platelet', 'rbc', 'wbc', 'hemoglobin'],
        icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 2a5 5 0 0 1 5 5c0 5-5 11-5 11S7 12 7 7a5 5 0 0 1 5-5z"/><circle cx="12" cy="7" r="2"/></svg>,
    },
    'Hormone Test': {
        label: 'BIOCHEMISTRY', bg: 'bg-[#FEE2E2]', color: '#DC2626',
        keywords: ['biochem', 'hormone', 'lipid', 'glucose', 'thyroid', 'metabol', 'enzyme', 'protein', 'cholesterol', 'kidney', 'liver', 'renal', 'hepat', 'creatinine', 'urea'],
        icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    },
    'Urine Test': {
        label: 'PATHOLOGY', bg: 'bg-[#EDE9FE]', color: '#7C3AED',
        keywords: ['urine', 'urinaly', 'pathol', 'biopsy', 'stool', 'culture', 'microbiol'],
        icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
    },
    'Imaging': {
        label: 'RADIOLOGY', bg: 'bg-[#DBEAFE]', color: '#2563EB',
        keywords: ['imaging', 'radiol', 'xray', 'x-ray', 'mri', 'ct scan', 'ultrasound', 'scan', 'digital', 'chest'],
        icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    },
    'Other': {
        label: 'CARDIOLOGY', bg: 'bg-[#FFF0F5]', color: '#DB2777',
        keywords: ['cardio', 'cardiac', 'ecg', 'ekg', 'heart', 'echo'],
        icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
    },
    'default': {
        label: 'REPORT', bg: 'bg-[#F3F4F6]', color: '#6B7280',
        keywords: [],
        icon: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
    },
};

function getCat(testType?: string, reportName?: string) {
    // Fuzzy keyword match against testType OR reportName
    const haystack = `${testType || ''} ${reportName || ''}`.toLowerCase();
    const key = (Object.keys(CAT) as CatKey[]).find(
        k => k !== 'default' && CAT[k as CatKey].keywords.some(kw => haystack.includes(kw))
    );
    return CAT[key || 'default'];
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* STABILITY BADGE                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
function StabilityBadge({ report }: { report: any }) {
    const isAbnormal = report.extractedData
        ? Object.values(report.extractedData).some((v: any) => v?.isAbnormal === true)
        : false;

    if (isAbnormal) {
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF1F2] border border-[#FECDD3] text-[10px] font-black text-[#BE123C] tracking-wide">
                <span className="w-[6px] h-[6px] rounded-full bg-[#F43F5E]" />
                High Priority
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEF9EC] border border-[#FDE68A] text-[10px] font-black text-[#92400E] tracking-wide">
            <span className="w-[6px] h-[6px] rounded-full bg-[#C8A84B]" />
            Normal Range
        </span>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* LINKEDIN-STYLE SHARE POPOVER                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function SharePopover({ report }: { report: any }) {
    const [open, setOpen]     = useState(false);
    const [copied, setCopied] = useState(false);
    const ref                 = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const reportLink = typeof window !== 'undefined' ? `${window.location.origin}/dashboard/patient/reports/${report._id}` : '';
    const reportText = `Check out my medical report \u201c${report.reportName || 'Medical Report'}\u201d on LbVault Health.`;

    const CHANNELS = [
        {
            id: 'whatsapp', label: 'WhatsApp', color: '#25D366',
            icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>,
            onClick: () => window.open(`https://wa.me/?text=${encodeURIComponent(reportText + '\n' + reportLink)}`, '_blank'),
        },
        {
            id: 'email', label: 'Email', color: '#EA4335',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
            onClick: () => window.open(`mailto:?subject=${encodeURIComponent('Medical Report: ' + report.reportName)}&body=${encodeURIComponent(reportText + '\n\n' + reportLink)}`, '_blank'),
        },
        {
            id: 'telegram', label: 'Telegram', color: '#2AABEE',
            icon: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
            onClick: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(reportLink)}&text=${encodeURIComponent(reportText)}`, '_blank'),
        },
        {
            id: 'sms', label: 'SMS / iMessage', color: '#34C759',
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
            onClick: () => window.open(`sms:?body=${encodeURIComponent(reportText + '\n' + reportLink)}`, '_blank'),
        },
    ];

    return (
        <div className="relative" ref={ref}>
            <button
                id={`share-btn-${report._id}`}
                onClick={() => setOpen(o => !o)}
                className="w-8 h-8 rounded-full hover:bg-[#EFF6FF] text-[#94A3B8] hover:text-[#2563EB] transition-colors flex items-center justify-center"
                title="Share Report"
            >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 bottom-full mb-2 z-50 w-[190px] bg-white rounded-[18px] shadow-[0_8px_36px_rgba(0,0,0,0.18)] border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-[9.5px] font-black text-gray-400 uppercase tracking-[0.14em]">Share via</p>
                        <p className="text-[11.5px] font-bold text-gray-800 truncate mt-0.5">{report.reportName}</p>
                    </div>
                    <div className="py-1.5">
                        {CHANNELS.map(ch => (
                            <button
                                key={ch.id}
                                onClick={() => { ch.onClick(); setOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                            >
                                <span style={{ color: ch.color }}>{ch.icon}</span>
                                <span className="text-[12.5px] font-semibold text-gray-700">{ch.label}</span>
                            </button>
                        ))}
                        <div className="h-px bg-gray-100 mx-3 my-1" />
                        <button
                            onClick={async () => {
                                await navigator.clipboard.writeText(reportLink);
                                setCopied(true);
                                setTimeout(() => { setCopied(false); setOpen(false); }, 1800);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                        >
                            <span style={{ color: copied ? '#C8A84B' : '#6B7280' }}>
                                {copied
                                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
                                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>}
                            </span>
                            <span className={`text-[12.5px] font-semibold ${copied ? 'text-[#C8A84B]' : 'text-gray-700'}`}>
                                {copied ? 'Link Copied!' : 'Copy Link'}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* REPORT CARD                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
function ReportCard({ report, onShare, onSchedule }: { report: any; onShare: (r: any) => void; onSchedule: (r: any) => void }) {
    const cat    = getCat(report.testType, report.reportName);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const refId  = report.lvId || (report._id || '').slice(-8).toUpperCase();
    // Resolve patientId — may be a populated object or raw string
    const patientName = typeof report.patientId === 'object' && report.patientId?.name
        ? report.patientId.name
        : report.patientName || null;
    // Date: prefer uploadDate → reportDate → createdAt
    const dateRaw = report.uploadDate || report.reportDate || report.createdAt;
    const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

    return (
        <div className="bg-white rounded-[18px] border border-[#EEE9DE] shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-all duration-300 px-6 py-5 flex items-center gap-5">

            {/* Category icon */}
            <div className={`w-14 h-14 rounded-[16px] ${cat.bg} flex items-center justify-center shrink-0`} style={{ color: cat.color }}>
                {cat.icon}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <h3 className="text-[14.5px] font-black text-[#1E3A5F] leading-tight mb-2">
                    {report.reportName}
                </h3>
                <span className="inline-block px-2.5 py-[3px] rounded-full border border-[#E2E8F0] text-[8px] font-black text-[#64748B] tracking-[0.14em] uppercase mb-2.5">
                    {cat.label}
                </span>
                <div className="space-y-[4px]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-medium">
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {patientName || 'You'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-medium">
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {dateStr || '—'}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] font-medium">
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 7h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 11h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2zM7 15h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
                        ID: #{refId}
                    </div>
                </div>
            </div>

            {/* Stability */}
            <div className="shrink-0 w-[135px]">
                <p className="text-[8px] font-black text-[#A0AEC0] tracking-[0.14em] uppercase mb-2">Stability</p>
                <StabilityBadge report={report} />
            </div>

            {/* Voice summary toggle */}
            <div className="shrink-0 w-[115px]">
                <VoiceToggle reportId={report._id} />
            </div>

            {/* Icon actions */}
            <div className="flex items-center gap-1.5 shrink-0">
                {/* Insights → report detail */}
                <Link
                    href={`/dashboard/patient/reports/${report._id}`}
                    className="w-8 h-8 rounded-full hover:bg-[#FEF3C7] text-[#94A3B8] hover:text-[#C8A84B] transition-colors flex items-center justify-center"
                    title="View Insights"
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                        <path d="M9 18h6"/><path d="M10 22h4"/>
                    </svg>
                </Link>
                {/* Share — LinkedIn-style popover */}
                <SharePopover report={report} />
                <a
                    href={report.fileUrl ? `${apiUrl}${report.fileUrl}` : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    title="Download PDF"
                    className="w-8 h-8 rounded-full hover:bg-[#F1F5F9] text-[#94A3B8] hover:text-[#475569] transition-colors flex items-center justify-center"
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                </a>
            </div>

            {/* View button */}
            <Link
                href={`/dashboard/patient/reports/${report._id}`}
                className="flex items-center gap-2 bg-[#1E3A5F] hover:bg-[#152C4A] active:scale-95 text-white text-[11.5px] font-black px-5 py-2.5 rounded-full transition-all shadow-[0_2px_8px_rgba(30,58,95,0.3)] shrink-0"
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
                View
            </Link>
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* FILTER CONFIG                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const SORT_OPTIONS = [
    { key: 'date_desc', label: 'Date: Newest First' },
    { key: 'date_asc',  label: 'Date: Oldest First' },
    { key: 'name_asc',  label: 'Name: A → Z' },
    { key: 'type_asc',  label: 'Type: A → Z' },
];

const FILTERS = ['All Reports', 'Hematology', 'Biochemistry', 'Radiology', 'Cardiology'];
const FILTER_MAP: Record<string, string | null> = {
    'All Reports':  null,
    'Hematology':   'Blood Test',
    'Biochemistry': 'Hormone Test',
    'Radiology':    'Imaging',
    'Cardiology':   'Other',
};
const PAGE_SIZE = 3;

/* ─────────────────────────────────────────────────────────────────────────── */
/* PAGE                                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export default function PatientReportsPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [reports,  setReports] = useState<any[]>([]);
    const [loading,  setLoading] = useState(true);
    const [filter,   setFilter]  = useState('All Reports');
    const [page,     setPage]    = useState(1);
    const [sortKey,  setSortKey]  = useState('date_desc');
    const [showSort, setShowSort] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    // Share modal state
    const [shareReport, setShareReport] = useState<any | null>(null);
    const [shareEmail,  setShareEmail]  = useState('');
    const [shareNote,   setShareNote]   = useState('');
    const [shareSending, setShareSending] = useState(false);
    const [shareMsg,    setShareMsg]    = useState('');

    // Schedule review modal state
    const [reviewReport,  setReviewReport]  = useState<any | null>(null);
    const [reviewSending, setReviewSending] = useState(false);
    const [reviewMsg,     setReviewMsg]     = useState('');

    // Close sort dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSort(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) { setLoading(false); return; }
        reportService.getPatientReports()
            .then(data => setReports(Array.isArray(data) ? data : []))
            .catch(() => setReports([]))
            .finally(() => setLoading(false));
    }, [user, authLoading]);

    const mappedType = FILTER_MAP[filter];
    const baseFiltered = mappedType ? reports.filter(r => r.testType === mappedType) : reports;

    // Apply sort
    const filtered = [...baseFiltered].sort((a, b) => {
        if (sortKey === 'date_asc')  return new Date(a.uploadDate || a.createdAt || 0).getTime() - new Date(b.uploadDate || b.createdAt || 0).getTime();
        if (sortKey === 'name_asc')  return (a.reportName || '').localeCompare(b.reportName || '');
        if (sortKey === 'type_asc')  return (a.testType || '').localeCompare(b.testType || '');
        // date_desc default
        return new Date(b.uploadDate || b.createdAt || 0).getTime() - new Date(a.uploadDate || a.createdAt || 0).getTime();
    });

    const currentSortLabel = SORT_OPTIONS.find(s => s.key === sortKey)?.label || 'Date: Newest First';
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const changeFilter = (f: string) => { setFilter(f); setPage(1); };

    /* ── Share report handler ─────────────────────────────────────────── */
    const handleShare = async () => {
        if (!shareReport) return;
        setShareSending(true);
        try {
            // Try backend share route; fall back to clipboard link gracefully
            const shareLink = `${window.location.origin}/dashboard/patient/reports/${shareReport._id}`;
            try {
                await api.post('/reports/share', {
                    reportId: shareReport._id,
                    email: shareEmail,
                    note: shareNote,
                });
                setShareMsg('Report access link sent to ' + shareEmail + '!');
            } catch {
                // Fallback — copy link to clipboard
                await navigator.clipboard.writeText(shareLink);
                setShareMsg('Link copied to clipboard! Send it to ' + shareEmail + ' manually.');
            }
            setTimeout(() => { setShareReport(null); setShareEmail(''); setShareNote(''); setShareMsg(''); }, 2800);
        } catch (err: any) {
            setShareMsg('Failed to share. Try again.');
        } finally {
            setShareSending(false);
        }
    };

    /* ── Schedule review handler ──────────────────────────────────────── */
    const handleScheduleReview = async () => {
        if (!reviewReport) return;
        setReviewSending(true);
        try {
            const res = await api.post('/patients/request-review', {
                reportId: reviewReport._id,
                reportName: reviewReport.reportName,
            });
            const msg: string = (res.data as any)?.message || 'Review request sent to your doctors!';
            setReviewMsg(msg.includes('No linked') ? msg : 'Review request sent! Your doctors will be notified and will contact you shortly.');
            setTimeout(() => { setReviewReport(null); setReviewMsg(''); }, 3500);
        } catch {
            setReviewMsg('Failed to send request. Please try again.');
        } finally {
            setReviewSending(false);
        }
    };

    return (
        <div className="space-y-6 pb-10">


            {/* ── Schedule Review Modal ───────────────────────────────────── */}
            {reviewReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[1.5rem] shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setReviewReport(null)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                        <div className="w-12 h-12 bg-[#FEF3C7] rounded-2xl flex items-center justify-center mb-4">
                            <svg width="22" height="22" fill="none" stroke="#C8A84B" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        </div>
                        <h2 className="text-lg font-black text-[#1E3A5F] mb-1">Request Doctor Review</h2>
                        <p className="text-[12px] text-gray-500 font-medium mb-2">Notify your doctors about <strong>{reviewReport.reportName}</strong>.</p>
                        <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">A notification will be sent to all doctors who have access to your records. They will receive your contact information and can reach out to schedule a consultation.</p>
                        {reviewMsg && <p className={`text-xs font-bold mb-4 ${reviewMsg.includes('sent') ? 'text-[#C8A84B]' : 'text-rose-500'}`}>{reviewMsg}</p>}
                        <button onClick={handleScheduleReview} disabled={reviewSending}
                            className="w-full py-3 bg-[#1E3A5F] text-white font-black rounded-2xl hover:bg-[#152C4A] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {reviewSending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending…</> : '📅 Send Review Request'}
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[28px] font-black text-[#0F172A] tracking-tight leading-none mb-1">
                        Medical Reports
                    </h1>
                    <p className="text-[13px] text-[#64748B] font-medium">
                        Manage and review your clinical documentation.
                    </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => reportService.getPatientReports().then(data => {
                            const rows = [['Report Name','Type','Date'],
                                ...(Array.isArray(data) ? data : []).map((r:any) => [
                                    r.reportName, r.testType,
                                    (r.uploadDate||r.createdAt) ? new Date(r.uploadDate||r.createdAt).toLocaleDateString() : '—'
                                ])];
                            const csv = rows.map(r => r.map(c=>`"${c}"`).join(',')).join('\n');
                            const url = URL.createObjectURL(new Blob([csv], {type:'text/csv'}));
                            const a = document.createElement('a'); a.href=url; a.download='reports.csv'; a.click();
                        })}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E2E8F0] bg-white text-[12px] font-black text-[#334155] hover:bg-[#F8FAFC] transition-colors shadow-sm">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        Export All
                    </button>
                    <Link href="/dashboard/patient"
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1E3A5F] hover:bg-[#152C4A] text-white text-[12px] font-black transition-colors shadow-[0_2px_8px_rgba(30,58,95,0.25)]">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
                        Upload Report
                    </Link>
                </div>
            </div>

            {/* Filters + Sort */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[10px] font-black text-[#94A3B8] tracking-[0.12em] uppercase">
                        Filter by:
                    </span>
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => changeFilter(f)}
                            className={`px-4 py-2 rounded-full text-[11.5px] font-bold border transition-all ${
                                filter === f
                                    ? 'bg-[#FBBF24] border-[#FBBF24] text-[#1A202C] shadow-sm'
                                    : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E0]'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                {/* Sort dropdown */}
                <div ref={sortRef} className="relative">
                    <button
                        onClick={() => setShowSort(s => !s)}
                        className="text-[11px] text-[#64748B] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors"
                    >
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/>
                            <line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/>
                        </svg>
                        {currentSortLabel}
                        <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {showSort && (
                        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-1.5 z-20 min-w-[200px]">
                            {SORT_OPTIONS.map(opt => (
                                <button key={opt.key} onClick={() => { setSortKey(opt.key); setShowSort(false); setPage(1); }}
                                    className={`w-full text-left px-4 py-2.5 text-[12px] font-bold transition-colors ${
                                        sortKey === opt.key ? 'text-[#C8A84B] bg-[#FEF9EC]' : 'text-[#64748B] hover:bg-[#F8FAFC]'
                                    }`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-[18px] border border-dashed border-[#E2E8F0] py-20 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-[#F8FAFC] rounded-full flex items-center justify-center">
                        <svg width="24" height="24" fill="none" stroke="#CBD5E0" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    <p className="text-[14px] font-black text-[#1E293B]">No reports found</p>
                    <p className="text-[12px] text-[#94A3B8] font-medium">
                        {filter !== 'All Reports' ? 'Try a different filter.' : 'Your lab reports will appear here.'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {paginated.map(r => (
                        <div key={r._id}>
                            <ReportCard report={r} onShare={setShareReport} onSchedule={setReviewReport} />
                            {/* Schedule Review inline */}
                            <div className="flex justify-end mt-1.5 pr-1">
                                <button
                                    onClick={() => setReviewReport(r)}
                                    className="text-[10.5px] font-bold text-[#94A3B8] hover:text-[#1E3A5F] transition-colors flex items-center gap-1"
                                >
                                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                    Schedule Doctor Review
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > 0 && (
                <div className="flex items-center justify-between pt-1">
                    <p className="text-[11.5px] text-[#94A3B8] font-medium">
                        Showing {paginated.length} of {filtered.length} reports
                    </p>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                className={`w-8 h-8 rounded-full text-[12px] font-black transition-colors ${
                                    page === n
                                        ? 'bg-[#1E3A5F] text-white shadow-sm'
                                        : 'border border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 rounded-full border border-[#E2E8F0] bg-white flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
