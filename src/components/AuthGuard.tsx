import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth-store';
interface AuthGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}
export function AuthGuard({ children, adminOnly = false }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}