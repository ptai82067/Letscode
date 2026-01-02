import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { routes } from '../routes';

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div />;

  if (!user || user.role !== 'admin') {
    return <Navigate to={routes.home()} replace />;
  }

  return <>{children}</>;
}
