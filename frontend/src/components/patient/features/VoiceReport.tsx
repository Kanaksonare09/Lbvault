'use client';

import React, { useState, useRef, useEffect } from 'react';
import { reportService } from '@/services/reportService';

interface VoiceReportProps {
    reportId: string;
    summaryText?: string;
}

const LANGUAGES = [
    { label: '🇬🇧 English', value: 'English' },
    { label: '🇮🇳 Hindi', value: 'Hindi' },
    { label: '🇮🇳 Marathi', value: 'Marathi' },
    { label: '🇮🇳 Telugu', value: 'Telugu' },
];

export default function VoiceReport({ reportId, summaryText }: VoiceReportProps) {
    const [language, setLanguage] = useState('English');
    const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'paused' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [voiceScript, setVoiceScript] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const blobUrlRef = useRef<string | null>(null);
    const progressRef = useRef<number>(0);

    const cleanup = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    useEffect(() => {
        return () => {
            cleanup();
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
        };
    }, []);

    const handleGenerate = async () => {
        cleanup();
        setErrorMsg('');
        setVoiceScript('');
        setAudioUrl(null);
        setProgress(0);
        setStatus('loading');

        try {
            const res = await reportService.getVoiceAudio(reportId, language);
            
            // Extract fields from new rich API response
            const responseData = res && typeof res === 'object' ? res : {};
            const audioPath: string = responseData.audioUrl || '';
            const script: string = responseData.voiceScript || responseData.empatheticSummary || '';
            
            setVoiceScript(script);

            if (!audioPath) throw new Error('No audio URL returned from server.');

            // Build full URL (path starts with /uploads/audio/...)
            const fullUrl = audioPath.startsWith('http')
                ? audioPath
                : `http://localhost:5010${audioPath}`;

            const audioResponse = await fetch(fullUrl);
            if (!audioResponse.ok) throw new Error(`Audio fetch failed: ${audioResponse.status}`);
            const audioBlob = await audioResponse.blob();

            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
            const localUrl = URL.createObjectURL(audioBlob);
            blobUrlRef.current = localUrl;
            setAudioUrl(fullUrl);

            const audio = new Audio(localUrl);
            audioRef.current = audio;

            audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
            audio.addEventListener('timeupdate', () => {
                const p = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
                progressRef.current = p;
                setProgress(p);
            });
            audio.addEventListener('ended', () => {
                setStatus('idle');
                setProgress(0);
            });
            audio.addEventListener('error', () => {
                setStatus('error');
                setErrorMsg('Audio playback failed.');
            });

            setStatus('playing');
            audio.play();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Voice generation failed';
            setErrorMsg(msg);
            setStatus('error');
        }
    };

    const handlePlayPause = () => {
        if (!audioRef.current) return;
        if (status === 'playing') {
            audioRef.current.pause();
            setStatus('paused');
        } else if (status === 'paused') {
            audioRef.current.play();
            setStatus('playing');
        }
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setStatus('idle');
        setProgress(0);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const val = Number(e.target.value);
        audioRef.current.currentTime = (val / 100) * audioRef.current.duration;
        setProgress(val);
    };

    const handleDownload = () => {
        if (!blobUrlRef.current) return;
        const a = document.createElement('a');
        a.href = blobUrlRef.current;
        a.download = `health-summary-${language.toLowerCase()}.wav`;
        a.click();
    };

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const isActive = status === 'playing' || status === 'paused';

    return (
        <div className="flex flex-col gap-4">
            {/* Controls Row */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Language Selector */}
                <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--background)] rounded-xl border border-[var(--border)]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
                    <select
                        value={language}
                        onChange={e => setLanguage(e.target.value)}
                        disabled={status === 'loading' || isActive}
                        className="bg-transparent text-xs font-bold text-[var(--primary)] outline-none cursor-pointer disabled:opacity-50"
                    >
                        {LANGUAGES.map(l => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>

                {/* Generate / Play / Pause */}
                {!isActive ? (
                    <button
                        id={`voice-generate-${reportId}`}
                        onClick={handleGenerate}
                        disabled={status === 'loading'}
                        className="flex-1 flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest hover:bg-[var(--foreground)] transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                <span>Generating…</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                <span>Listen in {language}</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="flex-1 flex items-center gap-2">
                        {/* Play/Pause toggle */}
                        <button
                            id={`voice-playpause-${reportId}`}
                            onClick={handlePlayPause}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--foreground)] transition-all active:scale-95"
                        >
                            {status === 'playing' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            )}
                        </button>

                        {/* Stop */}
                        <button onClick={handleStop} className="w-9 h-9 flex items-center justify-center rounded-xl bg-rose-500 text-white hover:bg-rose-600 transition-all active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>
                        </button>

                        {/* Download */}
                        <button onClick={handleDownload} title="Download audio" className="w-9 h-9 flex items-center justify-center rounded-xl bg-[var(--secondary)]/20 border border-[var(--secondary)]/30 text-[var(--primary)] hover:bg-[var(--secondary)]/40 transition-all active:scale-95">
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {isActive && (
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--primary)] tabular-nums w-8">
                        {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
                    </span>
                    <div className="relative flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                        <input
                            type="range" min="0" max="100" step="0.1"
                            value={progress}
                            onChange={handleSeek}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        />
                    </div>
                    <span className="text-[10px] font-bold text-[var(--primary)] tabular-nums w-8 text-right">
                        {duration ? formatTime(duration) : '--:--'}
                    </span>
                </div>
            )}

            {/* Voice Script Preview */}
            {voiceScript && (
                <div className="p-3 bg-gradient-to-br from-[var(--secondary)]/10 to-[var(--primary)]/5 border border-[var(--secondary)]/20 rounded-xl">
                    <div className="flex items-center gap-1.5 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                        <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-wider">Doctor's Voice Explanation</span>
                    </div>
                    <p className="text-xs text-[var(--primary)] leading-relaxed italic">"{voiceScript}"</p>
                </div>
            )}

            {/* Error */}
            {status === 'error' && errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700 font-medium">
                    <svg className="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{errorMsg}</span>
                </div>
            )}
        </div>
    );
}
