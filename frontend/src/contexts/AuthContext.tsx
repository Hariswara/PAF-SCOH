import React, { createContext, useEffect, useState } from 'react';
import api from '@/lib/api';

export type UserRole = 'STUDENT' | 'DOMAIN_ADMIN' | 'TECHNICIAN' | 'SUPER_ADMIN';
export type UserStatus = 'PENDING_PROFILE' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role?: UserRole;
  status: UserStatus;
  profilePicture?: string;
  domainId?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/auth/status');
      if (response.data.authenticated) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to check auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
