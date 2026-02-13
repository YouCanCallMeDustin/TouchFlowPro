import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';

interface User {
    id: string;
    email: string;
    name?: string | null;
    assignedLevel: string;
    currentLessonId: string | null;
    subscriptionStatus?: 'free' | 'pro' | 'cancelled';
    subscriptionEndDate?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('tfp_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyToken = async () => {
            if (token) {
                if (token === 'dev-bypass-token') {
                    setLoading(false);
                    return;
                }

                try {
                    const userData = await apiFetch<User>('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setUser(userData);
                } catch (error) {
                    console.error('Verify token error:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        verifyToken();
    }, [token]);

    const login = (newToken: string, userData: User) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem('tfp_token', newToken);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('tfp_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
