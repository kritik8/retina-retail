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
} from 'lucide-react';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
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
    <header
      className="h-14 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-150"
      style={{ background: 'var(--bg-overlay)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}
    >
      {/* Left: Shop Name */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <div className="p-1 rounded-md" style={{ background: 'var(--accent-subtle)', color: 'var(--accent-fg)' }}>
            <Store className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xs font-semibold leading-none" style={{ color: 'var(--fg)' }}>
                {shop?.shop_name || 'My Store'}
              </span>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--status-ok)' }} />
            </div>
            <span className="font-mono text-[9px] uppercase block mt-0.5" style={{ color: 'var(--fg-subtle)' }}>
              {shop?.business_type || 'Retail'} · {shop?.city || 'Live Node'}
            </span>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Button */}
      <button
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg text-xs w-60 justify-between transition-colors duration-150"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--fg-muted)' }}
      >
        <span className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
          <span className="font-sans">Search dashboard...</span>
        </span>
        <kbd
          className="font-mono text-[10px] px-1.5 py-0.5 rounded"
          style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--fg-subtle)' }}
        >
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="p-1.5 rounded-lg transition-colors duration-150"
          style={{ color: 'var(--fg-subtle)' }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 rounded-lg transition-colors"
          >
            <img
              src={
                user?.user_metadata?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.user_metadata?.full_name || 'Store Owner'
                )}&background=D4A84B&color=2A1E00&bold=true&length=1`
              }
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover"
              style={{ border: '1.5px solid var(--border-strong)' }}
            />
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--fg-subtle)' }} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-lg shadow-xl p-1.5 space-y-1 z-50 text-xs"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="font-serif font-semibold truncate" style={{ color: 'var(--fg)' }}>
                  {user?.user_metadata?.full_name || 'Store Owner'}
                </p>
                <p className="font-mono text-[10px] truncate mt-0.5" style={{ color: 'var(--fg-muted)' }}>{user?.email || 'authenticated'}</p>
              </div>

              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors"
                style={{ color: 'var(--fg)' }}
              >
                <Settings className="w-3.5 h-3.5" style={{ color: 'var(--fg-subtle)' }} />
                <span>Store Settings</span>
              </button>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4px' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors"
                  style={{ color: 'var(--status-err)' }}
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
