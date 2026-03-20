import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, X, Search } from 'lucide-react';
import Sidebar from './Sidebar';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { refreshAll, unreadCount } = useApp();
  const { user } = useAuth();

  useEffect(() => { refreshAll(); }, []);

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-64 h-full animate-slide-in">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
            <Menu size={20} className="text-surface-600 dark:text-surface-400" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-surface-900 dark:text-white">FinanceOS</span>
          </div>
          <div className="relative">
            <button className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors relative">
              <Bell size={20} className="text-surface-600 dark:text-surface-400" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
