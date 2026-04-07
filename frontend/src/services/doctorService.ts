import api from './api';

export interface DoctorProfile {
    name: string;
    email: string;
    phone: string;
    specialty: string;
    degree: string;
    experience: string;
    hospital: string;
    address: string;
    registrationNumber?: string;
    isVerified?: boolean;
}

export const doctorService = {
    // Directory: Fetch lab-affiliated doctors
    getDoctors: async () => {
        const res = await api.get('/pathology/doctors');
        return res.data;
    },

    // Registration: Create a new doctor account (Linked to lab)
    createDoctor: async (data: any, labId?: string) => {
        const payload = {
            ...data,
            role: 'doctor',
            password: 'Password123!', // Temporary default
            specialty: data.specialization || data.specialty,
            affiliatedLabId: labId
        };
        const res = await api.post('/auth/signup', payload);
        return res.data;
    },

    getProfile: async () => {
        const res = await api.get('/doctor/profile');
        return res.data;
    },

    updateProfile: async (data: Partial<DoctorProfile>) => {
        const res = await api.put('/doctor/profile', data);
        return res.data;
    },

    getAuthorizedPatients: async () => {
        const res = await api.get('/doctor/patients');
        return res.data;
    },

    getPatientDashboard: async (patientId: string) => {
        const res = await api.get(`/doctor/patient/${patientId}/dashboard`);
        return res.data;
    },

    addClinicalNote: async (reportId: string, note: string) => {
        const res = await api.post(`/reports/${reportId}/note`, { note });
        return res.data;
    }
};
