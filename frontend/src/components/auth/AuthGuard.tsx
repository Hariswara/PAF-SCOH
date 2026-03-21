import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * AuthGuard protects routes based on authentication status, user status, and roles.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  // 1. Not Authenticated -> Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Suspended -> Suspended Page
  if (user.status === 'SUSPENDED') {
    return <Navigate to="/suspended" replace />;
  }

  // 3. Pending Profile -> Registration flow
  if (user.status === 'PENDING_PROFILE' && location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
  }

  // 4. Pending Activation -> Waiting Page
  if (user.status === 'PENDING_ACTIVATION' && location.pathname !== '/pending-activation') {
    return <Navigate to="/pending-activation" replace />;
  }

  // 5. Active User but trying to access Register/Pending pages -> Dashboard
  if (user.status === 'ACTIVE' && (location.pathname === '/register' || location.pathname === '/pending-activation')) {
    return <Navigate to="/dashboard" replace />;
  }

  // 6. Role Check (if applicable)
  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

/**
 * GuestGuard ensures authenticated users cannot access login/landing pages.
 */
export const GuestGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated && user) {
    if (user.status === 'PENDING_PROFILE') return <Navigate to="/register" replace />;
    if (user.status === 'PENDING_ACTIVATION') return <Navigate to="/pending-activation" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
