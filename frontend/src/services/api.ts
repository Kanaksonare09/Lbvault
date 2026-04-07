import axios, { InternalAxiosRequestConfig } from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: `${apiUrl}/api`,
});

// ✅ Request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // ✅ Detailed URL Logging for Debugging
    console.log(`[AXIOS REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);

    const token =
        typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// ✅ Response interceptor (better debugging)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[AXIOS ERROR]');
        if (error.config) {
            console.error(`METHOD: ${error.config.method?.toUpperCase()}`);
            console.error(`URL: ${error.config.url}`);
        }
        console.error('CODE:', error.code);
        console.error('MESSAGE:', error.message);
        console.error('STATUS:', error.response?.status);
        console.error('DATA:', typeof error.response?.data === 'string' && error.response.data.includes('<!DOCTYPE html>') 
            ? 'HTML Response Received (Check if API route exists)' 
            : error.response?.data);
        
        return Promise.reject(error);
    }
);

export default api;