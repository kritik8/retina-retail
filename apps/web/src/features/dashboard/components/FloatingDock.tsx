import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Video,
  TrendingUp,
  AlertOctagon,
  FlaskConical,
  Clock,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/components/useTheme';

// ─── 6 core analytics pages for SIH demo ─────────────────────────────────────
export const navItems = [
  { path: '/dashboard/overview',                label: 'Overview',                icon: LayoutDashboard },
  { path: '/dashboard/live-monitor',            label: 'Live Monitor',            icon: Video },
  { path: '/dashboard/queue-intelligence',      label: 'Queue Intelligence',      icon: Clock },
  { path: '/dashboard/predictive-intelligence', label: 'Predictive Intelligence', icon: TrendingUp },
  { path: '/dashboard/bottleneck-diagnosis',    label: 'Bottleneck Diagnosis',    icon: AlertOctagon },
  { path: '/dashboard/what-if-simulator',       label: 'What-If Simulator',       icon: FlaskConical },
];

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => (
  <div
    className="w-px h-4 mx-0.5 shrink-0"
    style={{ background: 'var(--border-strong)', opacity: 0.5 }}
  />
);

// ─── Single dock button ───────────────────────────────────────────────────────
interface DockButtonProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const DockButton: React.FC<DockButtonProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className="relative flex items-center justify-center w-9 h-9 rounded-lg group transition-colors duration-100"
  >
    {/* Sliding active/hover highlight */}
    {isActive && (
      <motion.div
        layoutId="dock-pill"
        className="absolute inset-0 rounded-lg"
        style={{ background: 'var(--dock-active)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      />
    )}
    {!isActive && (
      <span
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        style={{ background: 'var(--dock-hover)' }}
      />
    )}
    <Icon
      className="w-4 h-4 relative z-10 transition-opacity duration-100"
      style={{
        color: isActive ? 'var(--fg)' : 'var(--fg-subtle)',
        opacity: isActive ? 1 : 0.65,
      }}
    />
  </button>
);

// ─── Floating Dock ────────────────────────────────────────────────────────────
interface FloatingDockProps {
  onOpenCommandPalette: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onOpenCommandPalette: _ }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, setTheme } = useTheme();

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      style={{ maxWidth: '96vw' }}
    >
      <div
        className="dock-glass flex items-center gap-0.5 px-2 py-2 rounded-full shadow-lg shadow-black/10 overflow-x-auto max-w-[95vw]"
        style={{ height: '52px' }}
      >
        {/* ── Core Nav Items ─────────────────────────────── */}
        {navItems.map((item) => (
          <DockButton
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}

        {/* Divider before utilities */}
        <Divider />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg group transition-colors duration-100"
        >
          <span
            className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-100"
            style={{ background: 'var(--dock-hover)' }}
          />
          {isDark
            ? <Sun className="w-4 h-4 relative z-10" style={{ color: 'var(--fg-subtle)', opacity: 0.65 }} />
            : <Moon className="w-4 h-4 relative z-10" style={{ color: 'var(--fg-subtle)', opacity: 0.65 }} />
          }
        </button>

      </div>
    </div>
  );
};
