import React, { useState, useEffect } from 'react';
import { Menu, Bell, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { loadAll, unreadCount } = useApp();
  const navigate = useNavigate();

  useEffect(() => { if (user) loadAll(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[var(--bg2)] border-r border-[var(--border)] flex-col">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-[var(--bg2)] border-r border-[var(--border)] z-50 animate-slide-in">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--bg2)] lg:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2 lg:hidden">
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/transactions?new=1')} className="btn-primary flex items-center gap-1.5 text-sm py-2 px-3">
              <Plus size={16} />
              <span className="hidden sm:inline">Add Transaction</span>
            </button>
            <button className="relative btn-ghost p-2.5 rounded-xl" onClick={() => navigate('/notifications')}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="page-enter">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;