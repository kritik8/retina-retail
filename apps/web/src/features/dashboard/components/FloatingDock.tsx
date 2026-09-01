import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Users,
  Package,
  Clock,
  Camera,
  Settings,
  Sun,
  Moon,
  LogOut,
  Command,
} from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/components/useTheme';

// ─── Nav Items ────────────────────────────────────────────────────────────────
export const navItems = [
  { path: '/dashboard/overview',           label: 'Overview',         icon: LayoutDashboard },
  { path: '/dashboard/store-map',          label: 'Store Map',        icon: Layers },
  { path: '/dashboard/shopper-analytics',  label: 'Shoppers',         icon: Users },
  { path: '/dashboard/inventory',          label: 'Inventory',        icon: Package },
  { path: '/dashboard/queue-intelligence', label: 'Queue',            icon: Clock },
  { path: '/dashboard/devices',            label: 'Devices',          icon: Camera },
  { path: '/dashboard/settings',           label: 'Settings',         icon: Settings },
];

// ─── Retina Eye Glyph ─────────────────────────────────────────────────────────
const RetinaGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.5 16C8.5 10.5 23.5 10.5 26.5 16C23.5 21.5 8.5 21.5 5.5 16Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="16" r="3.5" fill="currentColor" />
  </svg>
);

// ─── Floating Dock ────────────────────────────────────────────────────────────
interface FloatingDockProps {
  onOpenCommandPalette: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onOpenCommandPalette }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isDark, setTheme } = useTheme();
  const dockRef = useRef<HTMLDivElement>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Keyboard shortcut: '.' toggles dock ──────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '.') {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Outside-click collapses after 300ms ──────────────────────────────────
  useEffect(() => {
    if (!isExpanded) return;
    const handleClick = (e: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        collapseTimerRef.current = setTimeout(() => setIsExpanded(false), 280);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, [isExpanded]);

  const handleNavClick = useCallback(
    (path: string) => {
      navigate(path);
      // Collapse after short delay so user sees the active indicator shift
      setTimeout(() => setIsExpanded(false), 220);
    },
    [navigate]
  );

  const handleSignOut = async () => {
    setIsExpanded(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.user_metadata?.full_name || 'U'
    )}&background=E8D796&color=3D3000&bold=true&length=1`;

  return (
    <div
      ref={dockRef}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      style={{ maxWidth: '96vw' }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="dock-glass rounded-full px-2 py-2 flex items-center gap-1 shadow-xl shadow-black/10"
        style={{ overflow: 'hidden' }}
      >
        {/* ── Collapsed: Glyph Button ─────────────────────────────── */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-label="Toggle Navigation Dock"
          title="Toggle Navigation (.)"
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors duration-150"
          style={{
            background: isExpanded ? 'var(--accent-subtle)' : 'transparent',
            color: isExpanded ? 'var(--accent-fg)' : 'var(--fg-muted)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
          onMouseLeave={e => (e.currentTarget.style.background = isExpanded ? 'var(--accent-subtle)' : 'transparent')}
        >
          <RetinaGlyph className="w-5 h-5" />
        </button>

        {/* ── Expanded: Nav Items ─────────────────────────────────── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              key="nav-items"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
              className="flex items-center gap-0.5 overflow-hidden"
            >
              {/* Separator */}
              <div className="w-px h-5 mx-1.5 rounded-full" style={{ background: 'var(--border)' }} />

              {/* Nav Links */}
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    title={item.label}
                    className="relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors duration-150 group"
                    style={{
                      color: isActive ? 'var(--accent-fg)' : 'var(--fg-muted)',
                      minWidth: '52px',
                    }}
                  >
                    {/* Active sliding pill */}
                    {isActive && (
                      <motion.div
                        layoutId="dock-active-pill"
                        className="absolute inset-0 rounded-full"
                        style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <Icon
                      className="w-4 h-4 relative z-10 transition-transform duration-150 group-hover:scale-110"
                      style={{ opacity: isActive ? 1 : 0.55 }}
                    />
                    <span
                      className="relative z-10 whitespace-nowrap"
                      style={{ opacity: isActive ? 1 : 0.6 }}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}

              {/* Separator */}
              <div className="w-px h-5 mx-1.5 rounded-full" style={{ background: 'var(--border)' }} />

              {/* Command Palette */}
              <button
                onClick={() => { onOpenCommandPalette(); setIsExpanded(false); }}
                title="Command Palette (⌘K)"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
                style={{ color: 'var(--fg-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Command className="w-3.5 h-3.5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                title={isDark ? 'Light Mode' : 'Dark Mode'}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
                style={{ color: 'var(--fg-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-150"
                style={{ color: 'var(--fg-subtle)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

              {/* Avatar */}
              <button
                onClick={() => handleNavClick('/dashboard/settings')}
                title="Profile & Settings"
                className="ml-0.5 rounded-full p-0.5 transition-opacity hover:opacity-80"
              >
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover"
                  style={{ border: '1.5px solid var(--border)' }}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Keyboard hint — fades in after first visit */}
      {!isExpanded && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
          className="text-center mt-1.5 font-mono"
          style={{ fontSize: '10px', color: 'var(--fg-subtle)', letterSpacing: '0.04em' }}
        >
          Press <kbd className="px-1 py-0.5 rounded" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>.</kbd> to expand
        </motion.p>
      )}
    </div>
  );
};
