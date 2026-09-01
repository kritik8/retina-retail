import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingDock } from './components/FloatingDock';
import { CommandPalette } from './components/CommandPalette';
import { useAuth } from '@/features/auth/useAuth';
import { Search } from 'lucide-react';

const pageLabels: Record<string, string> = {
  '/dashboard/overview':           'Overview',
  '/dashboard/store-map':          'Store Digital Twin',
  '/dashboard/shopper-analytics':  'Shopper Analytics',
  '/dashboard/inventory':          'Inventory',
  '/dashboard/queue-intelligence': 'Queue Intelligence',
  '/dashboard/devices':            'Edge Devices',
  '/dashboard/settings':           'Settings',
};

export const DashboardLayout: React.FC = () => {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const location = useLocation();
  const { shop } = useAuth();

  // Cmd+K command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const pageLabel = pageLabels[location.pathname] || '';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--fg)' }}
    >
      {/* ── Minimal Silent Top Header ─────────────────────────── */}
      <header className="sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
        {/* Left: Shop + Page context */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: 'var(--status-ok)' }}
            />
            <span
              className="text-[13px] font-medium"
              style={{ color: 'var(--fg-muted)' }}
            >
              {shop?.shop_name || 'My Store'}
            </span>
          </div>
          {pageLabel && (
            <>
              <span style={{ color: 'var(--border-strong)', fontSize: '13px' }}>/</span>
              <span
                className="text-[13px] font-medium"
                style={{ color: 'var(--fg)' }}
              >
                {pageLabel}
              </span>
            </>
          )}
        </div>

        {/* Right: ⌘K trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors duration-150"
          style={{
            color: 'var(--fg-subtle)',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <Search className="w-3 h-3" />
          <span>Search</span>
          <kbd className="font-mono text-[10px] px-1 py-0.5 rounded" style={{ background: 'var(--bg-subtle)', color: 'var(--fg-subtle)' }}>
            ⌘K
          </kbd>
        </button>
      </header>

      {/* ── Main Content ──────────────────────────────────────── */}
      <main className="flex-1 px-5 sm:px-8 lg:px-12 max-w-7xl w-full mx-auto pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Floating Dock ─────────────────────────────────────── */}
      <FloatingDock onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />

      {/* ── Command Palette ───────────────────────────────────── */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};
