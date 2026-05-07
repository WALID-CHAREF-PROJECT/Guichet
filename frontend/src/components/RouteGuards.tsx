import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useUser } from '../contexts/UserContext';
import { getAuthToken } from '../services/api/authClient';

function roleHome(role: 'client' | 'organizer' | 'producer' | 'admin'): string {
  if (role === 'organizer' || role === 'producer') return '/ma-fr/organizer';
  if (role === 'admin') return '/ma-fr/admin';
  return '/ma-fr/account';
}

function Guard({ children, role }: { children: ReactNode; role?: 'client' | 'organizer' | 'admin' }): JSX.Element {
  const { user } = useUser();
  if (!user) return <Navigate to="/ma-fr/login" replace />;
  if (role === 'admin' && !getAuthToken()) return <Navigate to="/ma-fr/login" replace />;
  if (role) {
    const allowed = role === 'organizer' ? ['organizer', 'producer'] : [role];
    if (!allowed.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />;
  }
  return <>{children}</>;
}

export function RequireAuth({ children }: { children: ReactNode }): JSX.Element {
  return <Guard>{children}</Guard>;
}

export function RequireClient({ children }: { children: ReactNode }): JSX.Element {
  return <Guard role="client">{children}</Guard>;
}

export function RequireOrganizer({ children }: { children: ReactNode }): JSX.Element {
  return <Guard role="organizer">{children}</Guard>;
}

export function RequireAdmin({ children }: { children: ReactNode }): JSX.Element {
  return <Guard role="admin">{children}</Guard>;
}
