'use client';

import React, { useState, useRef } from 'react';
import { reportService } from '@/services/reportService';

interface UploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState('');
  const [testType, setTestType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TEST_TYPES = [
    'Complete Blood Count (CBC)',
    'Lipid Profile',
    'Thyroid Function Test',
    'Blood Glucose',
    'Liver Function Test',
    'Kidney Function Test',
    'Urine Analysis',
    'Hormone Test',
    'Other',
  ];

  const handleFile = (f: File) => {
    setFile(f);
    if (!reportName) setReportName(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a file.'); return; }
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('report', file);
    formData.append('reportName', reportName);
    formData.append('testType', testType);

    try {
      await reportService.uploadReport(formData, pct => setProgress(pct));
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-[var(--foreground)]">Upload Report</h2>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">Add your lab results to HealthScan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-xl transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold">
              {error}
            </div>
          )}

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-[var(--primary)] bg-[var(--accent)]/30 scale-[1.01]' : file ? 'border-[var(--primary)] bg-[var(--accent-soft)]' : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent-soft)]/30'}`}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            {file ? (
              <div className="space-y-1">
                <div className="w-12 h-12 bg-[var(--accent)] rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="font-black text-[var(--foreground)]">{file.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 bg-[var(--background)] rounded-2xl flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p className="font-black text-[var(--foreground)]">Drop PDF or Image here</p>
                <p className="text-xs text-[var(--muted-foreground)]">or click to browse · PDF, PNG, JPG</p>
              </div>
            )}
          </div>

          {/* Report Name */}
          <div className="floating-label-group">
            <input
              type="text"
              id="modalReportName"
              placeholder=" "
              required
              value={reportName}
              onChange={e => setReportName(e.target.value)}
            />
            <label htmlFor="modalReportName">Report Title</label>
          </div>

          {/* Test Type */}
          <div className="floating-label-group">
            <select id="modalTestType" required value={testType} onChange={e => setTestType(e.target.value)}>
              <option value="">Select Test Type</option>
              {TEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <label htmlFor="modalTestType">Test Category</label>
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold text-[var(--foreground)]">
                <span>Uploading & Processing…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-2xl border border-[var(--border)] text-[var(--muted-foreground)] font-black text-sm hover:bg-[var(--background)] transition-all">
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 py-3 rounded-2xl bg-[var(--primary)] text-white font-black text-sm hover:bg-[var(--primary)] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Processing…</span></>
              ) : (
                <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Upload Report</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
