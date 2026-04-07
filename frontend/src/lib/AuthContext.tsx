'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'pathology' | 'admin' | 'SuperAdmin';
    phone?: string;
    age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    bloodGroup?: string;
    address?: string;
    mustChangePassword?: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const verifySession = async () => {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            
            if (!token) {
                console.log('[AUTH] No session token found');
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                let res = null;
                try {
                    res = await fetch(`${apiUrl}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                } catch (fetchErr) {
                    console.warn('[AUTH] Backend offline or unreachable:', fetchErr);
                    // Swallow the network throw so Next.js doesn't show the error overlay
                }

                if (!res) {
                    // Backend connection failed handling: fall back to cached localStorage user
                    console.warn('[AUTH] Using fallback cached user session.');
                    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
                    if (cachedUser) {
                        try {
                            const parsed = JSON.parse(cachedUser);
                            setUser(parsed);
                        } catch { setUser(null); }
                    } else {
                        setUser(null);
                    }
                } else if (res.ok) {
                    const userData = await res.json();
                    const id = userData.id || userData._id;
                    let role = userData.role;
                    if (role === 'admin') role = 'pathology';
                    
                    setUser({ ...userData, id, role });
                } else {
                    console.warn('[AUTH] Session verification failed, status:', res.status);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setUser(null);
                }
            } catch (err) {
                console.warn('[AUTH] Session verification processing error:', err);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        verifySession();
    }, []);

    const getDashboardRoute = (role: string, mustChangePassword?: boolean) => {
        if (mustChangePassword) return '/dashboard/change-password';
        if (role === 'pathology') return '/dashboard/pathology';
        if (role === 'doctor') return '/dashboard/doctor';
        if (role === 'SuperAdmin') return '/dashboard/admin';
        return '/dashboard/patient';
    };

    const login = (userData: any, token: string) => {
        const id = userData.id || userData._id;
        let role = userData.role;
        if (role === 'admin') role = 'pathology';
        
        const normalizedUser = { ...userData, id, role };

        localStorage.setItem('user', JSON.stringify(normalizedUser));
        localStorage.setItem('token', token);
        setUser(normalizedUser);

        router.replace(getDashboardRoute(role, userData.mustChangePassword));
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        router.replace('/login');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
