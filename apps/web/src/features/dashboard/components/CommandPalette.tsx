import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/useTheme';
import { useAuth } from '@/features/auth/useAuth';
import {
  Search,
  LayoutDashboard,
  Layers,
  Users,
  Package,
  Clock,
  Camera,
  Settings,
  Moon,
  Sun,
  LogOut,
  ArrowRight,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions';
  icon: React.FC<{ className?: string; style?: React.CSSProperties }>;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { setTheme, isDark } = useTheme();
  const { logout } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { id: 'nav-overview',   title: 'Overview',              category: 'Navigation', icon: LayoutDashboard, shortcut: 'G O', action: () => { navigate('/dashboard/overview'); onClose(); } },
    { id: 'nav-store-map',  title: 'Store Digital Twin',    category: 'Navigation', icon: Layers,          shortcut: 'G M', action: () => { navigate('/dashboard/store-map'); onClose(); } },
    { id: 'nav-analytics',  title: 'Shopper Analytics',     category: 'Navigation', icon: Users,           shortcut: 'G A', action: () => { navigate('/dashboard/shopper-analytics'); onClose(); } },
    { id: 'nav-inventory',  title: 'Inventory',             category: 'Navigation', icon: Package,         shortcut: 'G I', action: () => { navigate('/dashboard/inventory'); onClose(); } },
    { id: 'nav-queue',      title: 'Queue Intelligence',    category: 'Navigation', icon: Clock,           shortcut: 'G Q', action: () => { navigate('/dashboard/queue-intelligence'); onClose(); } },
    { id: 'nav-devices',    title: 'Edge Devices',          category: 'Navigation', icon: Camera,          shortcut: 'G D', action: () => { navigate('/dashboard/devices'); onClose(); } },
    { id: 'nav-settings',   title: 'Settings',              category: 'Navigation', icon: Settings,        shortcut: 'G S', action: () => { navigate('/dashboard/settings'); onClose(); } },
    {
      id: 'action-theme',
      title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      category: 'Actions',
      icon: isDark ? Sun : Moon,
      action: () => { setTheme(isDark ? 'light' : 'dark'); onClose(); },
    },
    {
      id: 'action-logout',
      title: 'Sign Out',
      category: 'Actions',
      icon: LogOut,
      action: async () => { onClose(); await logout(); navigate('/login'); },
    },
  ];

  const filtered = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = {
    Navigation: filtered.filter(c => c.category === 'Navigation'),
    Actions:    filtered.filter(c => c.category === 'Actions'),
  };

  useEffect(() => { setSelectedIndex(0); }, [query]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
    else setQuery('');
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown')  { e.preventDefault(); setSelectedIndex(p => (p + 1) % (filtered.length || 1)); }
    if (e.key === 'ArrowUp')    { e.preventDefault(); setSelectedIndex(p => (p - 1 + filtered.length) % (filtered.length || 1)); }
    if (e.key === 'Enter')      { e.preventDefault(); filtered[selectedIndex]?.action(); }
    if (e.key === 'Escape')     { onClose(); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full max-w-lg z-10 overflow-hidden rounded-[12px] shadow-2xl"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            {/* Search bar */}
            <div
              className="flex items-center gap-2 px-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--fg-subtle)' }} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Navigate or run a command…"
                className="w-full py-3.5 text-[13px] bg-transparent focus:outline-none"
                style={{ color: 'var(--fg)' }}
              />
              <kbd
                className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded"
                style={{
                  background: 'var(--bg-subtle)',
                  color: 'var(--fg-subtle)',
                  border: '1px solid var(--border)',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-[13px]" style={{ color: 'var(--fg-muted)' }}>
                  No results for <span style={{ color: 'var(--fg)' }}>"{query}"</span>
                </div>
              ) : (
                Object.entries(grouped).map(([category, items]) =>
                  items.length === 0 ? null : (
                    <div key={category} className="mb-2">
                      <div
                        className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest"
                        style={{ color: 'var(--fg-subtle)' }}
                      >
                        {category}
                      </div>
                      {items.map(cmd => {
                        const Icon = cmd.icon;
                        const globalIndex = filtered.indexOf(cmd);
                        const isSelected = globalIndex === selectedIndex;
                        return (
                          <button
                            key={cmd.id}
                            onClick={cmd.action}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-100"
                            style={{
                              background: isSelected ? 'var(--accent-subtle)' : 'transparent',
                              border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}`,
                            }}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className="w-3.5 h-3.5 shrink-0"
                                style={{ color: isSelected ? 'var(--accent-fg)' : 'var(--fg-subtle)' }}
                              />
                              <span
                                className="text-[13px] font-medium"
                                style={{ color: isSelected ? 'var(--accent-fg)' : 'var(--fg)' }}
                              >
                                {cmd.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {cmd.shortcut && (
                                <span
                                  className="font-mono text-[10px] px-1.5 py-0.5 rounded"
                                  style={{
                                    background: 'var(--bg-subtle)',
                                    color: 'var(--fg-subtle)',
                                    border: '1px solid var(--border)',
                                  }}
                                >
                                  {cmd.shortcut}
                                </span>
                              )}
                              {isSelected && (
                                <ArrowRight className="w-3 h-3" style={{ color: 'var(--accent-fg)' }} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                )
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 py-2 text-[11px]"
              style={{ borderTop: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
            >
              <div className="flex items-center gap-3 font-mono">
                <span><kbd>↑↓</kbd> Navigate</span>
                <span><kbd>↵</kbd> Select</span>
              </div>
              <span>RetinaRetail</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
