import api from './api';
import { AnalyticsData } from '@/types';

// Mock data as fallback
const mockAnalytics: AnalyticsData = {
    totalReports: 1250,
    totalPatients: 450,
    patientGrowthRate: 12.5,
    efficiencyRate: 94,
    weeklyVolume: [120, 150, 180, 140, 200, 170, 190]
};

export const analyticsService = {
    getAnalytics: async (): Promise<AnalyticsData> => {
        try {
            const res = await api.get('/pathology/analytics');
            return res.data;
        } catch (err) {
            console.warn('Using mock analytics data');
            return mockAnalytics;
        }
    }
};
