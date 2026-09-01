import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import { useTheme } from '@/components/useTheme';
import {
  Search,
  Moon,
  Sun,
  Store,
  ChevronDown,
  LogOut,
  Settings,
  Menu,
} from 'lucide-react';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
  onToggleMobileMenu,
}) => {
  const { user, shop, logout } = useAuth();
  const { setTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-200">
      {/* Left: Mobile Menu Button + Shop Badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Shop Name Display / Switcher */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="p-1 rounded-md bg-indigo-600/10 text-indigo-500">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-900 dark:text-white leading-none">
                {shop?.shop_name || 'My Store'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize block mt-0.5">
              {shop?.business_type || 'Retail'} • {shop?.city || 'Live Node'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Trigger Button */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all text-xs w-64 justify-between"
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span>Search or jump to...</span>
        </span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls: Search Mobile Icon + Theme Toggle + User Menu */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Switcher Button */}
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            <img
              src={
                user?.user_metadata?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.user_metadata?.full_name || 'Store Owner'
                )}&background=4f46e5&color=fff`
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
            />
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Dropdown Box */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 space-y-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {user?.user_metadata?.full_name || 'Store Owner'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{user?.email || 'authenticated'}</p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Store Settings</span>
              </button>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
