import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, PieChart, BarChart3, HandCoins, Settings, TrendingUp, Bell, LogOut, Sun, Moon, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/budgets', icon: PieChart, label: 'Budgets' },
  { to: '/debts', icon: HandCoins, label: 'Debts' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useApp();
  const location = useLocation();

  return (
    <aside className="w-64 h-full flex flex-col bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-100 dark:border-surface-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow-sm">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-surface-900 dark:text-white text-base leading-tight">FinanceOS</p>
            <p className="text-xs text-surface-400">Smart Wallet</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} onClick={onClose}
              className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-idle'}`}>
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {label === 'Notifications' && unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">{unreadCount}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-surface-100 dark:border-surface-800 space-y-1">
        <button onClick={toggleTheme} className="nav-item nav-item-idle w-full">
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={logout} className="nav-item w-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut size={17} />
          <span>Logout</span>
        </button>
        <div className="flex items-center gap-3 px-3 py-2 mt-2">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">{user?.name}</p>
            <p className="text-xs text-surface-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
