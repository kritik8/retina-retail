import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireShop?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireShop = true }) => {
  const { user, shop, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-slate-400">Verifying session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but no shop registered -> force onboarding
  if (requireShop && !shop && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Authenticated with shop trying to access /onboarding -> redirect to dashboard
  if (!requireShop && shop && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return <>{children}</>;
};
