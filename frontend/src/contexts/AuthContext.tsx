/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Ensure assignments array is normalized (program_id/subcourse_id as strings)
  const normalizeUser = (u: any): User | null => {
    if (!u) return null;
    const out: any = { ...u };
    if (Array.isArray(out.assignments)) {
      out.assignments = out.assignments.map((a: any) => ({
        ...a,
        program_id: a?.program_id ? String(a.program_id) : undefined,
        subcourse_id: a?.subcourse_id ? String(a.subcourse_id) : undefined,
      }));
    } else {
      out.assignments = [];
    }
    return out as User;
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(normalizeUser(userData));
          setToken(storedToken);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    localStorage.setItem('token', response.token);
    setToken(response.token);
    setUser(normalizeUser(response.user));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
