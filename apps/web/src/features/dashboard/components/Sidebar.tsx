import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Package,
  Clock,
  Camera,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const navItems = [
  { path: '/dashboard/overview', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/shopper-analytics', label: 'Shopper Analytics', icon: Users },
  { path: '/dashboard/inventory', label: 'Inventory', icon: Package },
  { path: '/dashboard/queue-intelligence', label: 'Queue Intelligence', icon: Clock },
  { path: '/dashboard/devices', label: 'Edge Devices', icon: Camera },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const location = useLocation();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between p-3 select-none">
      <div className="space-y-6">
        {/* Brand Logo & Wordmark Header */}
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner shrink-0">
              <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.5 16C8.5 10.5 23.5 10.5 26.5 16C23.5 21.5 8.5 21.5 5.5 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="16" r="3.5" fill="currentColor" />
              </svg>
            </div>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  RetinaRetail
                </h2>
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-widest block mt-0.5">
                  Edge AI Dashboard
                </span>
              </motion.div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1 relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {/* Sliding Animated Highlight Pill */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-500/30 rounded-xl shadow-sm -z-0"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon className={`w-4 h-4 shrink-0 z-10 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />

                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate z-10"
                  >
                    {item.label}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Collapse Hint / Bottom Badge */}
      {!isCollapsed && (
        <div className="p-3 bg-slate-100 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <Store className="w-3.5 h-3.5 text-indigo-500" />
            <span>Store Hardware</span>
          </div>
          <p className="text-[10px] leading-tight text-slate-400">SNPE Edge Nodes Connected</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 bg-white/90 dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800/80 transition-all duration-250 ease-in-out shrink-0 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay Modal) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 bg-white dark:bg-slate-900 h-full border-r border-slate-200 dark:border-slate-800 relative z-10"
            >
              {sidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-lg flex items-center justify-around px-2 z-40">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-[60px]">{item.label.split(' ')[0]}</span>
            </NavLink>
          );
        })}
      </div>
    </>
  );
};
