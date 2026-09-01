import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './useAuth';
import { Button } from '@/components/ui/Button';
import { isConfiguredSupabase } from '@/lib/supabase';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, shop, isLoading, loginWithGoogle, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      if (shop) {
        navigate('/dashboard/overview', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
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

  const handleDemoLogin = () => {
    demoLogin();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl space-y-8 relative">
          
          {/* Logo & Brand Header */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
              <svg className="w-7 h-7 text-indigo-400" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 16C8.5 10.5 23.5 10.5 26.5 16C23.5 21.5 8.5 21.5 5.5 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="16" r="3.5" fill="currentColor" />
              </svg>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white">RetinaRetail</h1>
              <p className="text-xs text-indigo-400 font-medium tracking-wide uppercase mt-1">
                Edge-AI Retail Intelligence Platform
              </p>
            </div>

            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Sign in to manage your smart store analytics, queue intelligence, and real-time edge vision cameras.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              isLoading={isLoggingIn}
              variant="outline"
              size="lg"
              className="w-full bg-slate-950 border-slate-700 hover:bg-slate-800 hover:border-slate-600 text-white font-medium py-3 rounded-xl gap-3 shadow-md transition-all"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {!isConfiguredSupabase && (
              <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo Mode Available</span>
                </div>
                <Button
                  onClick={handleDemoLogin}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-slate-400 hover:text-slate-200"
                >
                  Quick Instant Demo Login →
                </Button>
              </div>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted Auth via Supabase Security</span>
          </div>

        </div>

        {/* Hackathon PS Subtext */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Smart India Hackathon 2026 • PS #26179
        </p>
      </motion.div>
    </div>
  );
};
