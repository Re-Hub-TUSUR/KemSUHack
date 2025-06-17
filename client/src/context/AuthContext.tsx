// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { User } from '../types';
import { fetchWithAuth as fetchWithAuthHelper } from '../utils/fetchWithAuth';

interface AuthContextType {
    isAuthenticated: boolean;
    currentUser: User | null;
    token: string | null;
    isLoading: boolean;
    login: (formData: Record<string, string>) => Promise<void>;
    register: (formData: Record<string, string>) => Promise<void>;
    logout: () => void;
    fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('authToken'));
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        setToken(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
        toast.info("Вы вышли из системы.");
    }, []);

    const fetchWithAuth = useCallback(async (url: string, options: RequestInit = {}) => {
        return fetchWithAuthHelper(url, options, handleLogout);
    }, [handleLogout]);

    useEffect(() => {
        const verifyUser = async () => {
            if (token) {
                try {
                    const response = await fetchWithAuth('/api/me');
                    if (response.ok) {
                        const data = await response.json();
                        setCurrentUser(data.user);
                        setIsAuthenticated(true);
                    } else {
                        // Если токен есть, но невалиден, выходим из системы
                        handleLogout();
                    }
                } catch (error) {
                    console.error("Ошибка проверки сессии:", error);
                    handleLogout(); // Выходим при сетевой или другой ошибке
                }
            }
            setIsLoading(false);
        };
        verifyUser();
    }, [token, fetchWithAuth, handleLogout]);

    const login = async (formData: Record<string, string>) => {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка входа');
        }
        localStorage.setItem('authToken', data.access_token);
        setToken(data.access_token);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        toast.success(`Добро пожаловать, ${data.user.username}!`);
    };

    const register = async (formData: Record<string, string>) => {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Ошибка регистрации');
        }
        toast.success(data.message || 'Регистрация успешна! Теперь вы можете войти.');
    };
    
    const value = {
        isAuthenticated,
        currentUser,
        token,
        isLoading,
        login,
        register,
        logout: handleLogout,
        fetchWithAuth
    };

    return (
        <AuthContext.Provider value={value}>
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