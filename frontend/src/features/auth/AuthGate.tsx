import type { ReactNode } from 'react';
import { Loading } from '../../components/Loading/Loading';
import { LoginPage } from '../../pages/LoginPage';
import { useAuth } from './AuthContext';

/** Shows the app only to a signed-in admin. */
export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'loading') return <Loading label="Loading..." />;
  if (status === 'anonymous') return <LoginPage />;
  return <>{children}</>;
}
