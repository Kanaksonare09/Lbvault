import api from './api';

export interface Notification {
    _id: string;
    recipient: string;
    actor?: {
        name: string;
        role: string;
        avatarUrl?: string;
    };
    type: 'new_report' | 'access_granted' | 'clinical_note' | 'account_approved' | 'system';
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationService = {
    getNotifications: async () => {
        const res = await api.get('/notifications');
        return res.data;
    },
    markAsRead: async (id: string | 'all') => {
        const res = await api.patch(`/notifications/${id}/read`);
        return res.data;
    }
};
