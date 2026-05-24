import api from './api';

export const adminService = {
    getPendingUsers: async () => {
        const res = await api.get('/admin/pending-users');
        return res.data;
    },
    approveUser: async (userId: string) => {
        const res = await api.post('/admin/approve-user', { userId });
        return res.data;
    },
    rejectUser: async (userId: string) => {
        const res = await api.post('/admin/reject-user', { userId });
        return res.data;
    }
};
