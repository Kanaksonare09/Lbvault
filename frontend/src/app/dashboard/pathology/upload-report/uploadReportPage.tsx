'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { reportService } from '@/services/reportService';
import { patientService } from '@/services/patientService';

function UploadForm() {
    const searchParams = useSearchParams();
    const [file, setFile] = useState<File | null>(null);
    const [patientQuery, setPatientQuery] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [reportName, setReportName] = useState('');
    const [testType, setTestType] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [dragActive, setDragActive] = useState(false);

    // Get patient from URL if provided
    useEffect(() => {
        const id = searchParams.get('patientId');
        const name = searchParams.get('name');
        if (id && name) {
            setSelectedPatient({ _id: id, name });
            setPatientQuery(name);
        }
    }, [searchParams]);

    // Search patients as the user types
    useEffect(() => {
        if (patientQuery.length > 2 && !selectedPatient) {
            const searchPatients = async () => {
                try {
                    const data = await patientService.searchPatients(patientQuery);
                    console.log(`[FRONTEND] Search results for "${patientQuery}":`, data);
                    setPatients(data);
                } catch (err) {
                    console.error('Patient search failed', err);
                }
            };
            const timeout = setTimeout(searchPatients, 400);
            return () => clearTimeout(timeout);
        } else {
            setPatients([]);
        }
    }, [patientQuery, selectedPatient]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            if (!reportName) {
                setReportName(e.target.files[0].name.split('.')[0]);
            }
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !selectedPatient) {
            setStatus({ type: 'error', message: 'Please select a file and a valid patient.' });
            return;
        }

        setUploading(true);
        setProgress(0);
        setStatus(null);

        const formData = new FormData();
        formData.append('report', file);
        formData.append('patientLvId', selectedPatient.lvId);
        formData.append('reportName', reportName);
        formData.append('testType', testType);

        try {
            await reportService.uploadReport(formData, (percent) => setProgress(percent));

            setStatus({ type: 'success', message: 'Report uploaded and linked to Patient ' + selectedPatient.lvId });
            setFile(null);
            setReportName('');
            setTestType('');
            setSelectedPatient(null);
            setPatientQuery('');
        } catch (err: any) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Upload failed. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-[#1F2933]">Upload Lab Report</h1>
                <p className="text-[#6B7280] mt-1 text-lg font-medium">Add a new digital record to the patient vault.</p>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-[#E2E8F0] overflow-hidden">
                <div className="p-8 lg:p-12">
                    {status && (
                        <div className={`mb-8 p-4 rounded-xl border-l-4 ${status.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700'
                            }`}>
                            <p className="font-bold">{status.type === 'success' ? 'Success!' : 'Error'}</p>
                            <p className="text-sm">{status.message}</p>
                        </div>
                    )}

                    <form onSubmit={handleUpload} className="max-w-2xl mx-auto space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                            <div className="floating-label-group relative">
                                <input
                                    type="text"
                                    id="patientSearch"
                                    placeholder=" "
                                    required
                                    value={patientQuery}
                                    onChange={(e) => {
                                        setPatientQuery(e.target.value);
                                        if (selectedPatient) setSelectedPatient(null);
                                    }}
                                    autoComplete="off"
                                    className={selectedPatient ? 'pr-20 border-emerald-500 bg-emerald-50/30' : ''}
                                />
                                <label htmlFor="patientSearch">Find Patient (Name/Email/LV-ID)</label>
                                
                                {selectedPatient && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                        <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter mr-2">Selected</span>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setSelectedPatient(null);
                                                setPatientQuery('');
                                            }}
                                            className="text-[#6B7280] hover:text-rose-500 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                        </button>
                                    </div>
                                )}

                                {patients.length > 0 && !selectedPatient && (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-[#E2E8F0] rounded-xl shadow-xl z-20 mt-2 max-h-48 overflow-y-auto">
                                        {patients.map((p) => (
                                            <div
                                                key={p._id}
                                                className="p-3 hover:bg-[#F6F7F5] cursor-pointer transition-colors border-b border-[#F6F7F5] last:border-0"
                                                onClick={() => {
                                                    setSelectedPatient(p);
                                                    setPatientQuery(`${p.name} (LV-${p.lvId})`);
                                                    setPatients([]);
                                                }}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-sm font-bold text-[#1F2933]">{p.name}</p>
                                                        <p className="text-[10px] font-black text-[#4F6F6F] uppercase tracking-widest mt-0.5">LV-ID: {p.lvId}</p>
                                                    </div>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="floating-label-group">
                                <input
                                    type="text"
                                    id="patientId"
                                    placeholder=" "
                                    readOnly
                                    value={selectedPatient?.lvId ? `LV-${selectedPatient.lvId}` : ''}
                                    className="bg-slate-50 cursor-not-allowed font-mono text-xs uppercase"
                                />
                                <label htmlFor="patientId">Vault ID (Auto-fill)</label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="floating-label-group">
                                <input
                                    type="text"
                                    id="reportName"
                                    placeholder=" "
                                    required
                                    value={reportName}
                                    onChange={(e) => setReportName(e.target.value)}
                                />
                                <label htmlFor="reportName">Report Title</label>
                            </div>
                            <div className="floating-label-group">
                                <select
                                    id="testType"
                                    required
                                    value={testType}
                                    onChange={(e) => setTestType(e.target.value)}
                                >
                                    <option value="">Select Test Type</option>
                                    <option value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</option>
                                    <option value="Lipid Profile">Lipid Profile</option>
                                    <option value="Thyroid Function Test">Thyroid Function Test</option>
                                    <option value="Blood Glucose">Blood Glucose</option>
                                    <option value="Liver Function Test">Liver Function Test</option>
                                    <option value="Kidney Function Test">Kidney Function Test</option>
                                    <option value="Urine Test">Urine Test</option>
                                </select>
                                <label htmlFor="testType">Test Category</label>
                            </div>
                        </div>

                        <div
                            className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all relative ${dragActive ? 'border-[#4F6F6F] bg-[#4F6F6F]/5' : 'border-[#E2E8F0] bg-[#F6F7F5]/50'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={() => setDragActive(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragActive(false);
                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                    setFile(e.dataTransfer.files[0]);
                                    setReportName(e.dataTransfer.files[0].name.split('.')[0]);
                                }
                            }}
                        >
                            <input
                                type="file"
                                className="hidden"
                                id="fileUpload"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleFileChange}
                            />
                            <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-6 border border-[#E2E8F0]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F6F6F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            </div>

                            {file ? (
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-[#4F6F6F]">{file.name}</h3>
                                    <p className="text-sm text-[#6B7280]">File ready for upload ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                                    <button
                                        type="button"
                                        className="text-rose-500 text-sm font-bold hover:underline"
                                        onClick={() => setFile(null)}
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-[#1F2933]">Drop lab report PDF or Image here</h3>
                                    <p className="text-[#6B7280] mt-1 font-medium text-lg">or click to browse from your computer</p>
                                    <label htmlFor="fileUpload" className="mt-8 inline-flex btn-secondary py-3 px-8 cursor-pointer shadow-sm hover:shadow-md transition-shadow">
                                        Select File
                                    </label>
                                </>
                            )}
                        </div>

                        {uploading && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm font-bold text-[#1F2933]">
                                    <span>Uploading & Processing...</span>
                                    <span>{progress}%</span>
                                </div>
                                <div className="h-3 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#4F6F6F] transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={uploading || !file || !selectedPatient}
                            className={`w-full group btn-primary h-16 text-xl shadow-lg transition-all transform ${(!file || !selectedPatient) 
                                ? 'opacity-40 cursor-not-allowed grayscale' 
                                : 'bg-[#4F6F6F] hover:bg-[#1F2933] hover:scale-[1.02] active:scale-[0.98]'}`}
                        >
                            {uploading ? (
                                <div className="flex items-center justify-center space-x-3">
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Processing Report...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center">
                                    <span>Confirm and Process Report</span>
                                    {file && selectedPatient && (
                                        <svg className="ml-3 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                    )}
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function UploadReportPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-[#8FB9A8] border-t-[#4F6F6F] rounded-full animate-spin"></div>
            </div>
        }>
            <UploadForm />
        </Suspense>
    );
}
