import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/useTheme';
import { useAuth } from '@/features/auth/useAuth';
import {
  Search,
  LayoutDashboard,
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
  icon: React.FC<{ className?: string }>;
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
    {
      id: 'nav-overview',
      title: 'Overview Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'G O',
      action: () => {
        navigate('/dashboard/overview');
        onClose();
      },
    },
    {
      id: 'nav-analytics',
      title: 'Shopper Analytics',
      category: 'Navigation',
      icon: Users,
      shortcut: 'G A',
      action: () => {
        navigate('/dashboard/shopper-analytics');
        onClose();
      },
    },
    {
      id: 'nav-inventory',
      title: 'Inventory & Shelf Monitoring',
      category: 'Navigation',
      icon: Package,
      shortcut: 'G I',
      action: () => {
        navigate('/dashboard/inventory');
        onClose();
      },
    },
    {
      id: 'nav-queue',
      title: 'Queue Intelligence',
      category: 'Navigation',
      icon: Clock,
      shortcut: 'G Q',
      action: () => {
        navigate('/dashboard/queue-intelligence');
        onClose();
      },
    },
    {
      id: 'nav-devices',
      title: 'Edge Vision Devices',
      category: 'Navigation',
      icon: Camera,
      shortcut: 'G D',
      action: () => {
        navigate('/dashboard/devices');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Store Settings',
      category: 'Navigation',
      icon: Settings,
      shortcut: 'G S',
      action: () => {
        navigate('/dashboard/settings');
        onClose();
      },
    },
    {
      id: 'action-theme',
      title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      category: 'Actions',
      icon: isDark ? Sun : Moon,
      shortcut: '⌘ T',
      action: () => {
        setTheme(isDark ? 'light' : 'dark');
        onClose();
      },
    },
    {
      id: 'action-logout',
      title: 'Sign Out of RetinaRetail',
      category: 'Actions',
      icon: LogOut,
      shortcut: '⌘ Q',
      action: async () => {
        onClose();
        await logout();
        navigate('/login');
      },
    },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="w-full max-w-xl bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 border-b border-slate-800/80 bg-slate-950/40">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command or search dashboard..."
                className="w-full px-3 py-4 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
              <span className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-wider border border-slate-700">
                ESC
              </span>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No commands matching "<span className="text-slate-300">{query}</span>"
                </div>
              ) : (
                filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer text-sm transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                        <span className="font-medium">{cmd.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cmd.shortcut && (
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isSelected
                                ? 'bg-indigo-700/60 border-indigo-400/40 text-indigo-100'
                                : 'bg-slate-800 border-slate-700 text-slate-400'
                            }`}
                          >
                            {cmd.shortcut}
                          </span>
                        )}
                        <ArrowRight className={`w-3.5 h-3.5 opacity-60 ${isSelected ? 'block' : 'hidden'}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Navigation Tips */}
            <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span><kbd className="font-mono text-slate-400">↑↓</kbd> Navigate</span>
                <span><kbd className="font-mono text-slate-400">↵</kbd> Select</span>
              </div>
              <span className="text-indigo-400 font-medium">RetinaRetail Quick Actions</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
