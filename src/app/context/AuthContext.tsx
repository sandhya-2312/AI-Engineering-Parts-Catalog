import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../lib/api/auth';
import { ApiError, clearStoredToken, getStoredToken, setStoredToken } from '../lib/api/client';
import type { ApiUser, UserRole } from '../lib/api/types';

interface AuthContextValue {
  user: ApiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  canWrite: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  syncSession: (result: { accessToken?: string; user?: ApiUser }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      return;
    }
    const profile = await authApi.me();
    setUser(profile);
  }, []);

  useEffect(() => {
    refreshProfile()
      .catch(() => {
        clearStoredToken();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const result = await authApi.login(email, password);
    setStoredToken(result.accessToken, rememberMe);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const result = await authApi.changePassword(currentPassword, newPassword);
    setStoredToken(result.accessToken, !!localStorage.getItem('accessToken'));
    setUser(result.user);
  }, []);

  const syncSession = useCallback((result: { accessToken?: string; user?: ApiUser }) => {
    if (result.accessToken) {
      setStoredToken(result.accessToken, !!localStorage.getItem('accessToken'));
    }
    if (result.user) setUser(result.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      canWrite: user?.role === 'admin' || user?.role === 'user',
      isAdmin: user?.role === 'admin',
      login,
      logout,
      refreshProfile,
      changePassword,
      syncSession,
    }),
    [user, isLoading, login, logout, refreshProfile, changePassword, syncSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    admin: 'Administrator',
    user: 'Engineer',
    viewer: 'Viewer',
  };
  return labels[role];
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
