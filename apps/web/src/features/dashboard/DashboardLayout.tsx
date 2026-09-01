import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/useAuth';
import {
  LayoutDashboard,
  Users,
  Package,
  Clock,
  Camera,
  Settings,
  LogOut,
  Store,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/shopper-analytics', label: 'Shopper Analytics', icon: Users },
  { path: '/dashboard/inventory', label: 'Inventory', icon: Package },
  { path: '/dashboard/queue-intelligence', label: 'Queue Intelligence', icon: Clock },
  { path: '/dashboard/devices', label: 'Edge Devices', icon: Camera },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const DashboardLayout: React.FC = () => {
  const { user, shop, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 16C8.5 10.5 23.5 10.5 26.5 16C23.5 21.5 8.5 21.5 5.5 16Z" stroke="currentColor" strokeWidth="2" />
                <circle cx="16" cy="16" r="3.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight leading-none">RetinaRetail</h2>
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Edge AI Live</span>
            </div>
          </div>

          {/* Active Shop Card */}
          {shop && (
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Store Profile</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-white truncate">{shop.shop_name}</p>
              <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
                <Store className="w-3 h-3 text-indigo-400" />
                <span>{shop.business_type} • {shop.city}</span>
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout Footer */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <img
              src={
                user?.user_metadata?.avatar_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'Store Owner')}&background=4f46e5&color=fff`
              }
              alt="Avatar"
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
            <div className="truncate flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {user?.user_metadata?.full_name || user?.email || 'Store Owner'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'authenticated'}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
