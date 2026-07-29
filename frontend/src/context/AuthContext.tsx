import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, loginAccount, registerAccount } from '@/api/auth';
import { getStoredToken, setStoredToken } from '@/lib/apiClient';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(getStoredToken()));

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetchCurrentUser()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => {
        setStoredToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const payload = await loginAccount({ email, password });
    setStoredToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const payload = await registerAccount({ name, email, password });
    setStoredToken(payload.token);
    setToken(payload.token);
    setUser(payload.user);
  }, []);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, isLoading, login, register, logout }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
