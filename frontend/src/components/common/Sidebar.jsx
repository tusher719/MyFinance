import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Wallet, Target, HandCoins, BarChart3, Tag, Settings, LogOut, Bell, Moon, Sun, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useApp } from '../../contexts/AppContext';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/accounts', icon: Wallet, label: 'Accounts' },
  { to: '/budgets', icon: Target, label: 'Budgets' },
  { to: '/debts', icon: HandCoins, label: 'Debts' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/notifications', icon: Bell, label: 'Notifications', badge: true },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ onClose }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-glow">
            <span className="text-white font-black text-base">W</span>
          </div>
          <div>
            <p className="font-black text-[var(--text)] text-base leading-tight">WalletOS</p>
            <p className="text-[10px] text-[var(--text3)] leading-tight">Finance Manager</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1.5 lg:hidden">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
        {NAV.map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={onClose}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={17} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && unreadCount > 0 && (
              <span className="bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-[var(--border)] pt-3 space-y-0.5">
        <button onClick={toggleTheme} className="nav-item w-full">
          {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-primary-500" />}
          <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button onClick={handleLogout} className="nav-item w-full !text-red-500 hover:!bg-red-50 dark:hover:!bg-red-900/20">
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-2 bg-[var(--bg3)] rounded-xl">
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text)] truncate">{user?.name}</p>
            <p className="text-[10px] text-[var(--text3)] truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
