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
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <span className="font-mono text-xs" style={{ color: 'var(--fg-muted)' }}>Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireShop && !shop && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireShop && shop && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return <>{children}</>;
};
