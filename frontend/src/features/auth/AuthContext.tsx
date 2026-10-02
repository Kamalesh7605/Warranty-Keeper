import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '../../services/api';
import { authApi } from '../../services/authApi';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  status: Status;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>('loading');
  const [username, setUsername] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    setUsername(null);
    setStatus('anonymous');
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    authApi.me()
      .then((s) => { setUsername(s.username); setStatus('authenticated'); })
      .catch(() => setStatus('anonymous'));
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const login = useCallback(async (user: string, password: string) => {
    const session = await authApi.login(user, password);
    setUsername(session.username);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(() => ({ status, username, login, logout }), [status, username, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
