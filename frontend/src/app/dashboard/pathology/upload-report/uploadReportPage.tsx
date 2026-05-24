'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { reportService } from '@/services/reportService';
import { patientService } from '@/services/patientService';

// ─── Types ────────────────────────────────────────────────────────────────────
type UrgencyLevel = 'Routine' | 'Priority' | 'STAT/Urgent';
type UploadStage = 'uploading' | 'processing' | 'extracting' | 'done';

const TEST_TYPES = [
    'Hematology Full Panel',
    'Complete Blood Count (CBC)',
    'Lipid Profile',
    'Thyroid Function Test',
    'Blood Glucose',
    'Liver Function Test',
    'Kidney Function Test',
    'Metabolic Panel v4',
    'Tissue Biopsy Analysis',
    'Blood Smear Profiling',
    'Urine Test',
];

// ─── Spinner SVG ─────────────────────────────────────────────────────────────
function Spinner({ size = 14, color = 'var(--primary)' }: { size?: number; color?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="animate-spin"
            style={{ animationDuration: '0.8s' }}
        >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
    );
}

// ─── Stage indicator ──────────────────────────────────────────────────────────
function StageIndicator({
    label,
    state,
}: {
    label: string;
    state: 'active' | 'spinning' | 'idle';
}) {
    return (
        <div className="flex items-center gap-1.5">
            {state === 'active' && (
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            )}
            {state === 'spinning' && <Spinner size={13} color="var(--muted-foreground)" />}
            {state === 'idle' && (
                <span className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
            )}
            <span
                className="text-[11px] font-bold tracking-widest uppercase"
                style={{
                    color:
                        state === 'active'
                            ? '#16A34A'
                            : state === 'spinning'
                            ? 'var(--muted-foreground)'
                            : '#9CA3AF',
                }}
            >
                {label}
            </span>
        </div>
    );
}

// ─── Main Upload Form ─────────────────────────────────────────────────────────
function UploadForm() {
    const searchParams = useSearchParams();

    // ── State ─────────────────────────────────────────────────────────────────
    const [file, setFile] = useState<File | null>(null);
    const [patientQuery, setPatientQuery] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [reportName, setReportName] = useState('');
    const [testType, setTestType] = useState('Hematology Full Panel');
    const [urgency, setUrgency] = useState<UrgencyLevel>('STAT/Urgent');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadStage, setUploadStage] = useState<UploadStage>('uploading');
    const [dragActive, setDragActive] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Pre-fill from URL params
    useEffect(() => {
        const id = searchParams.get('patientId');
        const name = searchParams.get('name');
        if (id && name) {
            setSelectedPatient({ _id: id, name });
            setPatientQuery(name);
        }
    }, [searchParams]);

    // Patient search
    useEffect(() => {
        if (patientQuery.length > 2 && !selectedPatient) {
            const timer = setTimeout(async () => {
                try {
                    const data = await patientService.searchPatients(patientQuery);
                    setPatients(data);
                    setShowDropdown(true);
                } catch {
                    // silent
                }
            }, 400);
            return () => clearTimeout(timer);
        } else {
            setPatients([]);
            setShowDropdown(false);
        }
    }, [patientQuery, selectedPatient]);

    // Click-outside for dropdown
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            if (!reportName) setReportName(f.name.split('.')[0]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const f = e.dataTransfer.files?.[0];
        if (f) {
            setFile(f);
            if (!reportName) setReportName(f.name.split('.')[0]);
        }
    };

    const simulateStages = (pct: number) => {
        if (pct < 50) setUploadStage('uploading');
        else if (pct < 85) setUploadStage('processing');
        else setUploadStage('extracting');
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedPatient) {
            setStatus({ type: 'error', message: 'Please select a file and a valid patient.' });
            return;
        }

        setUploading(true);
        setProgress(0);
        setUploadStage('uploading');
        setStatus(null);

        const formData = new FormData();
        formData.append('report', file);
        formData.append('patientLvId', selectedPatient.lvId);
        formData.append('reportName', reportName);
        formData.append('testType', testType);

        try {
            await reportService.uploadReport(formData, (pct) => {
                setProgress(pct);
                simulateStages(pct);
            });
            setUploadStage('done');
            setStatus({ type: 'success', message: 'Report uploaded and linked to Patient ' + selectedPatient.lvId });
            setFile(null);
            setReportName('');
            setTestType('Hematology Full Panel');
            setSelectedPatient(null);
            setPatientQuery('');
        } catch (err: any) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Upload failed. Please try again.',
            });
        } finally {
            setUploading(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(1) : '0';
    const displayFileName = file?.name ?? 'Report_ID_99284.pdf';

    return (
        <div className="max-w-[720px] mx-auto">

            {/* ── Page Title ──────────────────────────────────────────────── */}
            <div className="text-center mb-8">
                <h1
                    className="font-black text-gray-900"
                    style={{ fontSize: '2.2rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}
                >
                    Upload Diagnostics
                </h1>
                <p
                    className="text-gray-500 mt-3 font-normal leading-relaxed"
                    style={{ fontSize: '14px', maxWidth: '480px', margin: '12px auto 0' }}
                >
                    Seamlessly ingest pathology reports into the clinical workflow. Our AI-driven
                    system extracts data in real-time.
                </p>
            </div>

            {/* ── Status Banner ───────────────────────────────────────────── */}
            {status && (
                <div
                    className={`mb-5 px-4 py-3 rounded-xl text-[13px] font-semibold flex items-center gap-2 ${
                        status.type === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                >
                    {status.type === 'success' ? (
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                    )}
                    {status.message}
                </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">

                {/* ── Card 1: Patient & Study Details ─────────────────────── */}
                <div
                    className="bg-white rounded-2xl p-6"
                    style={{
                        border: '1px solid #E8EDF2',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    }}
                >
                    {/* Card header */}
                    <div className="flex items-center gap-2.5 mb-5">
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: '#EBF3FF' }}
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--primary)" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h2 className="text-[14.5px] font-bold text-gray-800">Patient &amp; Study Details</h2>
                    </div>

                    {/* Row 1: Patient Search + Test Type */}
                    <div className="grid grid-cols-2 gap-4 mb-4">

                        {/* Patient Search */}
                        <div className="relative" ref={dropdownRef}>
                            <label
                                className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5"
                            >
                                Patient Search
                            </label>
                            <div
                                className="flex items-center rounded-xl px-3 py-2.5"
                                style={{
                                    background: '#F4F6F9',
                                    border: `1px solid ${selectedPatient ? '#86EFAC' : '#E8EDF2'}`,
                                }}
                            >
                                <input
                                    type="text"
                                    value={patientQuery}
                                    onChange={(e) => {
                                        setPatientQuery(e.target.value);
                                        if (selectedPatient) setSelectedPatient(null);
                                    }}
                                    onFocus={() => patients.length > 0 && setShowDropdown(true)}
                                    placeholder="Start typing name or ID..."
                                    autoComplete="off"
                                    className="flex-1 bg-transparent text-[13px] text-gray-700 font-medium outline-none placeholder:text-gray-400"
                                />
                                {selectedPatient ? (
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedPatient(null); setPatientQuery(''); }}
                                        className="text-gray-400 hover:text-red-400 transition-colors ml-1 shrink-0"
                                    >
                                        <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                    </button>
                                ) : (
                                    <svg className="shrink-0 ml-1" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#9CA3AF" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                )}
                            </div>

                            {/* Dropdown */}
                            {showDropdown && patients.length > 0 && !selectedPatient && (
                                <div
                                    className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl overflow-hidden z-30"
                                    style={{
                                        border: '1px solid #E8EDF2',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        maxHeight: '180px',
                                        overflowY: 'auto',
                                    }}
                                >
                                    {patients.map((p) => (
                                        <button
                                            key={p._id}
                                            type="button"
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                            onClick={() => {
                                                setSelectedPatient(p);
                                                setPatientQuery(`${p.name} (LV-${p.lvId})`);
                                                setPatients([]);
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <p className="text-[13px] font-semibold text-gray-800">{p.name}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">LV-ID: {p.lvId}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Test Type */}
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                                Test Type
                            </label>
                            <div
                                className="relative rounded-xl"
                                style={{ background: '#F4F6F9', border: '1px solid #E8EDF2' }}
                            >
                                <select
                                    value={testType}
                                    onChange={(e) => setTestType(e.target.value)}
                                    required
                                    className="w-full bg-transparent text-[13px] text-gray-700 font-medium outline-none px-3 py-2.5 appearance-none pr-8 cursor-pointer"
                                >
                                    {TEST_TYPES.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <svg
                                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                                    width="14"
                                    height="14"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="#9CA3AF"
                                    strokeWidth="2.5"
                                >
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Urgency Level */}
                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Urgency Level
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {/* Routine */}
                            <button
                                type="button"
                                onClick={() => setUrgency('Routine')}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold transition-all"
                                style={{
                                    background: urgency === 'Routine' ? '#DBEAFE' : '#EEF2F7',
                                    color: urgency === 'Routine' ? '#1D4ED8' : 'var(--muted-foreground)',
                                    border: urgency === 'Routine' ? '1px solid #BFDBFE' : '1px solid transparent',
                                }}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                                Routine
                            </button>

                            {/* Priority */}
                            <button
                                type="button"
                                onClick={() => setUrgency('Priority')}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold transition-all"
                                style={{
                                    background: urgency === 'Priority' ? '#DBEAFE' : '#EEF2F7',
                                    color: urgency === 'Priority' ? '#1D4ED8' : 'var(--muted-foreground)',
                                    border: urgency === 'Priority' ? '1px solid #BFDBFE' : '1px solid transparent',
                                }}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="2" x2="12" y2="12" />
                                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                                </svg>
                                Priority
                            </button>

                            {/* STAT / Urgent */}
                            <button
                                type="button"
                                onClick={() => setUrgency('STAT/Urgent')}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold transition-all"
                                style={{
                                    background: urgency === 'STAT/Urgent' ? 'var(--primary)' : '#EEF2F7',
                                    color: urgency === 'STAT/Urgent' ? '#fff' : 'var(--muted-foreground)',
                                    border: 'none',
                                    boxShadow:
                                        urgency === 'STAT/Urgent'
                                            ? '0 2px 8px rgba(200,168,75,0.35)'
                                            : 'none',
                                }}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                </svg>
                                STAT / Urgent
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Card 2: Drop Zone ────────────────────────────────────── */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    className="rounded-2xl text-center transition-all"
                    style={{
                        border: `2px dashed ${dragActive ? 'var(--primary)' : '#D5D9E2'}`,
                        background: dragActive ? '#FEFCE8' : '#FAFAF6',
                        padding: '48px 40px',
                    }}
                >
                    {file ? (
                        /* File selected state */
                        <div className="space-y-3">
                            {/* Amber circle icon */}
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                                style={{ background: 'var(--primary)' }}
                            >
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <h3 className="text-[15px] font-bold text-gray-800">{file.name}</h3>
                            <p className="text-[12px] text-gray-400">Ready to upload &bull; {fileSizeMB} MB</p>
                            <button
                                type="button"
                                onClick={() => { setFile(null); setReportName(''); }}
                                className="text-[12px] font-semibold text-red-400 hover:text-red-500 transition-colors mt-1"
                            >
                                Remove file
                            </button>
                        </div>
                    ) : (
                        /* Empty state */
                        <>
                            {/* Amber upload circle */}
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                                style={{ background: 'var(--primary)' }}
                            >
                                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <polyline points="12 12 12 18" />
                                    <polyline points="9 15 12 12 15 15" />
                                </svg>
                            </div>

                            <h3
                                className="font-bold text-gray-800 mb-2"
                                style={{ fontSize: '17px' }}
                            >
                                Drag diagnostics reports here
                            </h3>
                            <p
                                className="text-gray-400 mb-6 leading-relaxed"
                                style={{ fontSize: '13px', maxWidth: '360px', margin: '0 auto 24px' }}
                            >
                                Supported formats: DICOM, PDF, JPG, or HL7 standard files. Maximum size 50MB per file.
                            </p>

                            {/* Select Files button */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                id="fileUpload"
                                accept=".pdf,.png,.jpg,.jpeg,.dcm"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center justify-center font-semibold transition-all"
                                style={{
                                    fontSize: '13.5px',
                                    padding: '10px 28px',
                                    borderRadius: '999px',
                                    border: '1.5px solid var(--primary)',
                                    background: 'transparent',
                                    color: '#8B6914',
                                    letterSpacing: '0.01em',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--primary)';
                                    (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                    (e.currentTarget as HTMLButtonElement).style.color = '#8B6914';
                                }}
                            >
                                Select Files from Workstation
                            </button>
                        </>
                    )}
                </div>

                {/* ── Processing Analysis Bar (visible when uploading) ──────── */}
                {uploading && (
                    <div
                        className="rounded-2xl p-5"
                        style={{
                            background: '#FAFAF3',
                            border: '1px solid #E8E4CC',
                            borderLeft: '4px solid var(--primary)',
                            boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                        }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-[13px] font-bold text-gray-800">Processing Analysis</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                    {displayFileName}&nbsp;&bull;&nbsp;{fileSizeMB} MB
                                </p>
                            </div>
                            <span
                                className="font-black text-gray-700"
                                style={{ fontSize: '20px', letterSpacing: '-0.03em' }}
                            >
                                {progress}%
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div
                            className="w-full rounded-full overflow-hidden mb-3"
                            style={{ height: '6px', background: '#E5E7EB' }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, #5C4A1E 0%, var(--primary) 100%)',
                                }}
                            />
                        </div>

                        {/* Stage indicators */}
                        <div className="flex items-center gap-6">
                            <StageIndicator
                                label="Uploading"
                                state={
                                    uploadStage === 'uploading'
                                        ? 'active'
                                        : uploadStage === 'processing' || uploadStage === 'extracting' || uploadStage === 'done'
                                        ? 'active'
                                        : 'idle'
                                }
                            />
                            <StageIndicator
                                label="Processing"
                                state={
                                    uploadStage === 'processing'
                                        ? 'spinning'
                                        : uploadStage === 'extracting' || uploadStage === 'done'
                                        ? 'active'
                                        : 'idle'
                                }
                            />
                            <StageIndicator
                                label="Extracting"
                                state={
                                    uploadStage === 'extracting'
                                        ? 'spinning'
                                        : uploadStage === 'done'
                                        ? 'active'
                                        : 'idle'
                                }
                            />
                        </div>
                    </div>
                )}

                {/* ── Submit Button ──────────────────────────────────────────── */}
                <button
                    type="submit"
                    disabled={uploading || !file || !selectedPatient}
                    className="w-full flex items-center justify-center gap-2 font-bold transition-all"
                    style={{
                        padding: '14px',
                        borderRadius: '14px',
                        fontSize: '14px',
                        background:
                            !file || !selectedPatient
                                ? '#E5E7EB'
                                : 'var(--primary)',
                        color: !file || !selectedPatient ? '#9CA3AF' : '#fff',
                        cursor: !file || !selectedPatient ? 'not-allowed' : 'pointer',
                        boxShadow:
                            file && selectedPatient
                                ? '0 4px 14px rgba(200,168,75,0.3)'
                                : 'none',
                        letterSpacing: '0.01em',
                    }}
                >
                    {uploading ? (
                        <>
                            <div
                                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                                style={{ animationDuration: '0.7s' }}
                            />
                            Processing Report...
                        </>
                    ) : (
                        <>
                            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            Confirm and Process Report
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

// ─── Page export with Suspense ────────────────────────────────────────────────
export default function UploadReportPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                    <div
                        className="w-10 h-10 border-4 rounded-full animate-spin"
                        style={{ borderColor: '#E8EDF2', borderTopColor: 'var(--primary)' }}
                    />
                </div>
            }
        >
            <UploadForm />
        </Suspense>
    );
}
