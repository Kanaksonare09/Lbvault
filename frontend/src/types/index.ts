export type UserRole = 'patient' | 'doctor' | 'pathology' | 'admin';

export interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: UserRole;
    lvId?: string;
    profile?: {
        phone?: string;
        specialization?: string;
        hospital?: string;
        bio?: string;
        avatar?: string;
    };
}

export interface Patient {
    _id: string;
    name: string;
    email: string;
    lvId?: string;
}

export interface Report {
    _id: string;
    reportName: string;
    patientId: string | { _id: string; name: string };
    testType: string;
    category?: string;
    fileUrl: string;
    status?: 'processing' | 'ready' | 'failed';
    uploadDate?: string;
    reportDate?: string;
    createdAt?: string;
    pathologyId?: string | { _id: string; name: string; email: string };
    doctorId?: string | { _id: string; name: string; email: string };
    extractedData?: Record<string, any>;
    biomarkers?: ReportBiomarker[];
    aiSummary?: string;
    voiceSummaryUrl?: string;
    doctorComment?: string;
}

export interface ReportBiomarker {
    _id: string;
    reportId: string;
    patientId: string;
    biomarkerName: string;
    value: number;
    unit: string;
    referenceMin?: number;
    referenceMax?: number;
    isAbnormal: boolean;
    source: 'ai_extracted' | 'lab_api' | 'manual';
    testDate: string;
}

export interface ReportAiAnalysis {
    _id: string;
    reportId: string;
    ocrText?: string;
    summaryEn?: string;
    insightsEn?: string;
    doctorBriefEn?: string;
    translations?: Record<string, string>;
    audioUrls?: Record<string, string>;
    generatedAt?: string;
}

export interface AnalyticsData {
    totalReports: number;
    totalPatients: number;
    patientGrowthRate: number;
    efficiencyRate: number;
    weeklyVolume: number[];
    testTypes?: { name: string; count: number }[];
}
