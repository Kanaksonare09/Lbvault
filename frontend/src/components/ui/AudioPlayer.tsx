'use client';

import React, { useState, useRef, useEffect } from 'react';
import { reportService } from '@/services/reportService';

const LANGUAGES = [
  { label: 'English', value: 'English' },
  { label: 'Hindi (हिंदी)', value: 'Hindi' },
  { label: 'Marathi (मराठी)', value: 'Marathi' },
  { label: 'Punjabi (ਪੰਜਾਬੀ)', value: 'Punjabi' },
  { label: 'Tamil (தமிழ்)', value: 'Tamil' },
];

interface AudioPlayerProps {
  reportId: string;
  reportName?: string;
  compact?: boolean;
}

export default function AudioPlayer({ reportId, reportName, compact = false }: AudioPlayerProps) {
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [audioUrl]);

  const [isReady, setIsReady] = useState(false);

  const fetchAudio = async () => {
    setIsLoading(true);
    setError(null);
    setIsReady(false);
    try {
      const res = await reportService.getVoiceAudio(reportId, language);
      
      // Safely extract audioUrl from new rich response object
      const audioPath: string = (res && typeof res === 'object' && res.audioUrl)
        ? String(res.audioUrl)
        : typeof res === 'string' ? res : '';

      if (!audioPath) throw new Error('No audio URL returned from server.');

      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010').replace(/\/$/, '');
      const url = audioPath.startsWith('http') ? audioPath : `${apiUrl}${audioPath}`;
      
      setAudioUrl(url);

      // Stop and clean up previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.onended = () => { setIsPlaying(false); setProgress(0); };
      
      // Handle browser autoplay policy — play() returns a Promise
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setIsReady(false);
          intervalRef.current = setInterval(() => {
            if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100);
          }, 200);
        })
        .catch(() => {
          // Autoplay blocked — show "Tap to Play" button instead of crashing
          setIsReady(true);
          setIsPlaying(false);
        });
    } catch (err: any) {
      setError(err?.message || 'Audio generation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current && !isReady) { fetchAudio(); return; }
    if (isReady && audioRef.current) {
      // User tapped after autoplay was blocked — now allowed
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setIsReady(false);
        intervalRef.current = setInterval(() => {
          if (audioRef.current?.duration) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }, 200);
      });
      return;
    }
    if (!audioRef.current) { fetchAudio(); return; }
    if (isPlaying) {
      audioRef.current.pause();
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      audioRef.current.play();
      intervalRef.current = setInterval(() => {
        if (audioRef.current?.duration) setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }, 200);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * audioRef.current.duration;
    setProgress(pct * 100);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setIsPlaying(false);
    setProgress(0);
    setError(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-10 h-10 bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:bg-[var(--foreground)] transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isReady ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          ) : isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
        <select
          value={language}
          onChange={e => handleLanguageChange(e.target.value)}
          className="text-xs font-bold text-[var(--primary)] bg-white border border-[var(--border)] rounded-xl px-3 py-2 outline-none"
        >
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[var(--border)] rounded-[32px] p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-xs font-black text-[var(--muted-foreground)] uppercase tracking-widest">AI Voice Summary</p>
          {reportName && <p className="text-sm font-bold text-[var(--foreground)] truncate">{reportName}</p>}
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex gap-2 flex-wrap mb-5">
        {LANGUAGES.map(l => (
          <button
            key={l.value}
            onClick={() => handleLanguageChange(l.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${language === l.value
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'bg-[var(--background)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div
        className="h-2 bg-[var(--background)] rounded-full mb-3 cursor-pointer relative overflow-hidden"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs font-bold text-[#94A3B8] mb-5">
        <span>{formatTime(audioRef.current ? (progress / 100) * duration : 0)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-14 h-14 bg-[var(--primary)] text-white rounded-full flex items-center justify-center hover:bg-[var(--foreground)] transition-all shadow-lg active:scale-95 disabled:opacity-60"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isReady ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          ) : isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          )}
        </button>
      </div>

      {isReady && (
        <p className="text-center text-xs font-bold text-[var(--primary)] mt-3 animate-pulse">
          ✅ Audio ready — tap ▶ to play
        </p>
      )}

      {error && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-2xl">
          <p className="text-xs font-bold text-rose-600">{error}</p>
        </div>
      )}

      {isLoading && (
        <p className="text-center text-xs font-bold text-[var(--primary)] mt-4 animate-pulse">
          Generating AI voice in {language}…
        </p>
      )}
    </div>
  );
}
