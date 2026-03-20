import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, CheckCheck, Info, Target, HandCoins, Wallet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import toast from 'react-hot-toast';

const iconMap = {
  budget_alert: { icon: Target,   bg: 'bg-amber-100 dark:bg-amber-900/40',   color: 'text-amber-600 dark:text-amber-400' },
  debt_reminder:{ icon: HandCoins,bg: 'bg-blue-100 dark:bg-blue-900/40',     color: 'text-blue-600 dark:text-blue-400'   },
  low_balance:  { icon: Wallet,   bg: 'bg-red-100 dark:bg-red-900/40',       color: 'text-red-600 dark:text-red-400'     },
  info:         { icon: Info,     bg: 'bg-primary-100 dark:bg-primary-900/40',color: 'text-primary-600 dark:text-primary-400' },
  system:       { icon: Bell,     bg: 'bg-[var(--bg3)]',                     color: 'text-[var(--text2)]'                },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount } = useApp();

  const load = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.data.notifications || []);
      setUnread(res.data.data.unread || 0);
      setUnreadCount(res.data.data.unread || 0);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await notificationAPI.markRead(id);
    setNotifications(ns => ns.map(n => n._id === id ? { ...n, isRead: true } : n));
    setUnread(u => Math.max(0, u - 1));
    setUnreadCount(u => Math.max(0, u - 1));
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(ns => ns.map(n => ({ ...n, isRead: true })));
    setUnread(0);
    setUnreadCount(0);
    toast.success('All marked as read');
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-black text-[var(--text)]">Notifications</h1>
          {unread > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-600 text-white">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="btn-ghost text-sm flex items-center gap-1.5 text-[var(--text2)]">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[var(--border)]">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3 p-4">
                <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="skeleton h-3.5 w-1/3 rounded" />
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-[var(--bg3)] rounded-2xl flex items-center justify-center mb-3">
              <Bell size={24} className="text-[var(--text3)]" />
            </div>
            <p className="font-semibold text-[var(--text)]">All caught up!</p>
            <p className="text-sm text-[var(--text2)] mt-1">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map(n => {
              const { icon: Icon, bg, color } = iconMap[n.type] || iconMap.info;
              return (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`flex gap-3 p-4 cursor-pointer transition-colors
                    hover:bg-[var(--bg3)]
                    ${!n.isRead
                      ? 'bg-primary-50 dark:bg-[#1a2040]'
                      : 'bg-[var(--bg2)]'
                    }`}
                >
                  {/* Icon badge */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                    <Icon size={18} className={color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm text-[var(--text)] leading-tight ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--text2)] mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-[var(--text3)] mt-1.5">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;