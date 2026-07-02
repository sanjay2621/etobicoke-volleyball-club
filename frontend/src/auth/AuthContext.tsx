import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../api/client';
import type { AuthResponse, Role } from '../types';

type AuthState = {
  email: string;
  role: Role;
  playerId: number | null;
} | null;

type AuthContextValue = {
  user: AuthState;
  login: (email: string, password: string) => Promise<AuthResponse>;
  registerAccount: (email: string, password: string) => Promise<AuthResponse>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, password: string) => Promise<AuthResponse>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeFromToken(): AuthState {
  const token = tokenStore.access;
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      email: payload.sub,
      role: payload.role as Role,
      playerId: payload.pid && payload.pid >= 0 ? payload.pid : null,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState>(decodeFromToken());

  const value = useMemo<AuthContextValue>(() => {
    const persist = (res: AuthResponse) => {
      tokenStore.set(res.accessToken, res.refreshToken);
      setUser({ email: res.email, role: res.role, playerId: res.playerId });
      return res;
    };
    return {
      user,
      login: async (email, password) => {
        const res = await api.post<AuthResponse>('/auth/login', { email, password });
        return persist(res.data);
      },
      registerAccount: async (email, password) => {
        const res = await api.post<AuthResponse>('/auth/register-account', { email, password });
        return persist(res.data);
      },
      requestPasswordReset: async (email) => {
        await api.post('/auth/request-password-reset', { email });
      },
      resetPassword: async (email, code, password) => {
        const res = await api.post<AuthResponse>('/auth/reset-password', { email, code, password });
        return persist(res.data);
      },
      logout: () => {
        tokenStore.clear();
        setUser(null);
      },
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
