'use client';

import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { reportService } from '@/services/reportService';

interface VoiceSummaryButtonProps {
    text?: string;
    lang?: string;
    reportId?: string;
    patientId?: string;
    disabled?: boolean;
    isIcon?: boolean;
    compact?: boolean;
    label?: string;
}

export default function VoiceSummaryButton({ text, lang, reportId, patientId, disabled, isIcon = false, compact = false, label }: VoiceSummaryButtonProps) {
    const { language, t } = useLanguage();
    const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const urlRef = useRef<string | null>(null);

    const cleanup = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (urlRef.current) {
            URL.revokeObjectURL(urlRef.current);
            urlRef.current = null;
        }
    };

    const speak = async () => {
        if (!reportId && !patientId) return;

        cleanup();
        setStatus('loading');

        try {
            const targetLang = lang || language;
            const data = await reportService.getVoiceAudio(reportId, targetLang, patientId);
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010';
            const url = data.audioUrl?.startsWith('http') ? data.audioUrl : `${apiBase}${data.audioUrl}`;
            
            const audio = new Audio(url);
            audioRef.current = audio;
            
            setStatus('playing');
            audio.play();
            
            audio.onended = () => { setStatus('idle'); cleanup(); };
            audio.onerror = () => { setStatus('idle'); cleanup(); };
        } catch (err) {
            console.error('[VOICE ERROR]', err);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    const stop = () => { cleanup(); setStatus('idle'); };

    const displayLabel = label || (patientId ? 'Overall Analysis' : 'Report Summary');

    // ── Compact mode: small 32px icon-only button (for card rows) ─────────────
    if (compact) {
        return (
            <button
                onClick={status === 'playing' ? stop : speak}
                disabled={disabled || status === 'loading'}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all outline-none active:scale-95 ${
                    disabled || status === 'loading'
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : status === 'playing'
                    ? 'border-rose-200 bg-rose-50 text-rose-500'
                    : 'border-gray-200 bg-white text-gray-500 hover:text-[var(--primary)] hover:border-blue-200 hover:bg-[var(--accent-soft)]'
                }`}
                title={status === 'playing' ? 'Stop Audio' : 'Play Voice Summary'}
            >
                {status === 'loading' ? (
                    <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                ) : status === 'playing' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                )}
            </button>
        );
    }

    if (isIcon) {
        return (
            <button 
                onClick={status === 'playing' ? stop : speak}
                disabled={disabled || status === 'loading'}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 outline-none active:scale-95 group relative ${
                    disabled || status === 'loading'
                    ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200'
                    : status === 'playing'
                    ? 'bg-rose-500 text-white shadow-rose-500/30'
                    : patientId 
                    ? 'bg-[var(--foreground)] text-white hover:bg-[var(--primary)] shadow-lg'
                    : 'bg-[#F5C842] text-[#1a1000] hover:bg-[#f0c030] shadow-[#F5C842]/30'
                }`}
                title={status === 'playing' ? "Stop Audio" : `Play ${displayLabel}`}
            >
                {status === 'loading' ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                ) : status === 'playing' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                )}
                {status === 'playing' && (
                    <>
                        <span className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-75"></span>
                        <span className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></span>
                    </>
                )}
            </button>
        );
    }

    return (
        <button 
            onClick={status === 'playing' ? stop : speak}
            disabled={disabled || status === 'loading'}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border outline-none active:scale-95 ${
                disabled || status === 'loading'
                ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed opacity-60'
                : status === 'playing'
                ? 'bg-rose-500 text-white border-rose-600 hover:bg-rose-600 shadow-lg'
                : 'bg-[var(--background)] text-[var(--primary)] border-[var(--border)] hover:bg-white hover:shadow-md hover:border-[var(--secondary)]'
            }`}
        >
            {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin"></div>
            ) : status === 'playing' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
            )}
            <span>
                {status === 'loading' ? 'Preparing...' : status === 'playing' ? 'Stop' : `Voice Summary (${label || (patientId ? 'Patient' : 'Report')})`}
            </span>
        </button>
    );
}
