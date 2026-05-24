import api from './api';
import { Patient } from '@/types';

export const patientService = {
    getDoctorPatients: async (): Promise<Patient[]> => {
        const res = await api.get('/doctor/patients');
        return res.data;
    },
    searchPatients: async (query: string): Promise<Patient[]> => {
        const res = await api.get(`/patients/search?query=${encodeURIComponent(query)}`);
        return res.data;
    },
    registerPatient: async (data: any): Promise<Patient> => {
        const res = await api.post('/patients/register', data);
        return res.data;
    },
    updatePatient: async (id: string, data: any): Promise<Patient> => {
        const res = await api.put(`/patients/${id}`, data);
        return res.data;
    },
    deletePatient: async (id: string): Promise<any> => {
        const res = await api.delete(`/patients/${id}`);
        return res.data;
    },
    grantAccess: async (doctorId: string, reportId: string | null = null): Promise<any> => {
        const res = await api.post('/access/grant', { doctorId, reportId });
        return res.data;
    },
    revokeAccess: async (doctorId: string, reportId: string | null = null): Promise<any> => {
        const res = await api.post('/access/revoke', { doctorId, reportId });
        return res.data;
    },
    getAccessList: async (): Promise<any[]> => {
        const res = await api.get('/access/list');
        return res.data;
    },
    searchDoctors: async (query: string): Promise<any[]> => {
        const res = await api.get(`/auth/search-doctors?query=${encodeURIComponent(query)}`);
        return res.data;
    }
};
