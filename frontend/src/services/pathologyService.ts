import api from './api';

export interface PathologyProfile {
    name: string;
    email: string;
    phone: string;
    labName: string;
    licenseNumber: string;
    address: string;
    city: string;
    isVerified: boolean;
    paymentPlan?: string;
}

export const pathologyService = {
    getProfile: async () => {
        const res = await api.get('/pathology/profile');
        return res.data;
    },
    updateProfile: async (data: Partial<PathologyProfile>) => {
        const res = await api.put('/pathology/profile', data);
        return res.data;
    },
    getAnalytics: async () => {
        const res = await api.get('/pathology/analytics');
        return res.data;
    }
};
