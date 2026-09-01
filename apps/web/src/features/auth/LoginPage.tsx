import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './useAuth';
import { isConfiguredSupabase } from '@/lib/supabase';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, shop, isLoading, loginWithGoogle, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      navigate(shop ? '/dashboard/overview' : '/onboarding', { replace: true });
    }
  }, [user, shop, isLoading, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex items-center gap-3" style={{ color: 'var(--fg-muted)' }}>
          <div
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <span className="text-[13px]">Checking authentication…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="w-full max-w-sm space-y-8"
      >
        {/* Logo + Brand */}
        <div className="text-center space-y-3">
          <div
            className="w-11 h-11 rounded-[10px] flex items-center justify-center mx-auto"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" style={{ color: 'var(--fg)' }}>
              <path
                d="M5.5 16C8.5 10.5 23.5 10.5 26.5 16C23.5 21.5 8.5 21.5 5.5 16Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="16" r="3.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h1
              className="text-[22px] font-semibold tracking-tight"
              style={{ color: 'var(--fg)' }}
            >
              RetinaRetail
            </h1>
            <p className="text-[12px] mt-0.5 font-mono uppercase tracking-widest" style={{ color: 'var(--fg-subtle)' }}>
              Edge-AI Retail Intelligence
            </p>
          </div>
          <p className="text-[13px] max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Sign in to manage your store analytics, queue intelligence, and edge vision cameras.
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="rounded-[10px] p-6 space-y-4"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors duration-150 disabled:opacity-50"
            style={{
              background: 'var(--bg)',
              color: 'var(--fg)',
              border: '1px solid var(--border)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            {isLoggingIn ? (
              <div
                className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--fg-muted)', borderTopColor: 'transparent' }}
              />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"/>
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"/>
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          {/* Demo Mode */}
          {!isConfiguredSupabase && (
            <div className="space-y-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium w-fit mx-auto font-mono"
                style={{
                  background: 'var(--accent-subtle)',
                  color: 'var(--accent-fg)',
                  border: '1px solid var(--accent)',
                }}
              >
                <Sparkles className="w-3 h-3" />
                <span>Demo Mode</span>
              </div>
              <button
                onClick={() => demoLogin()}
                className="w-full text-[12px] py-2 transition-colors"
                style={{ color: 'var(--fg-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-muted)')}
              >
                Enter demo without credentials →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 text-[11px]" style={{ color: 'var(--fg-subtle)' }}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted auth via Supabase · Smart India Hackathon 2026 · PS #26179</span>
        </div>
      </motion.div>
    </div>
  );
};
