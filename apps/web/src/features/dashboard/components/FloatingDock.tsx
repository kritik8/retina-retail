import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useTheme } from '@/components/useTheme';
import { useAuth } from '@/features/auth/useAuth';

// ─── Nav Items ────────────────────────────────────────────────────────────────
export const navItems = [
  { path: '/dashboard/overview',           label: 'Overview',         icon: LayoutDashboard },
  { path: '/dashboard/shopper-analytics',  label: 'Shoppers',         icon: Users },
  { path: '/dashboard/inventory',          label: 'Inventory',        icon: Package },
  { path: '/dashboard/queue-intelligence', label: 'Queue',            icon: Clock },
  { path: '/dashboard/devices',            label: 'Devices',          icon: Camera },
  { path: '/dashboard/store-map',          label: 'Store Map',        icon: Layers },
  { path: '/dashboard/settings',           label: 'Settings',         icon: Settings },
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
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
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
    {/* Sliding active/hover highlight — shared layoutId for spring transition */}
    {isActive && (
      <motion.div
        layoutId="dock-pill"
        className="absolute inset-0 rounded-lg"
        style={{ background: 'var(--dock-active)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      />
    )}
    {/* Hover-only highlight (non-active) */}
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

// ─── Floating Dock (always visible, never collapses) ─────────────────────────
interface FloatingDockProps {
  onOpenCommandPalette: () => void;
}

export const FloatingDock: React.FC<FloatingDockProps> = ({ onOpenCommandPalette: _ }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, setTheme } = useTheme();
  const { user } = useAuth();

  const avatarUrl =
    user?.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user?.user_metadata?.full_name || 'U'
    )}&background=D4A84B&color=2A1E00&bold=true&length=1`;

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50"
      style={{ maxWidth: '96vw' }}
    >
      <div
        className="dock-glass flex items-center gap-0.5 px-2 py-2 rounded-full shadow-lg shadow-black/10"
        style={{ height: '52px' }}
      >
        {/* ── Primary Nav Items ───────────────────────────── */}
        {navItems.slice(0, 6).map((item) => (
          <DockButton
            key={item.path}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          />
        ))}

        {/* Divider before settings */}
        <Divider />

        {/* Settings */}
        <DockButton
          icon={navItems[6].icon}
          label={navItems[6].label}
          isActive={location.pathname === navItems[6].path}
          onClick={() => navigate(navItems[6].path)}
        />

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

        {/* Avatar */}
        <button
          onClick={() => navigate('/dashboard/settings')}
          title="Profile & Settings"
          className="relative flex items-center justify-center w-9 h-9 rounded-lg group transition-opacity duration-100 hover:opacity-80"
        >
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-6 h-6 rounded-full object-cover"
            style={{ border: '1.5px solid var(--border-strong)' }}
          />
        </button>
      </div>
    </div>
  );
};
