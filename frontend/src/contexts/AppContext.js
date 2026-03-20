import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { accountAPI, categoryAPI, tagAPI, notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [accounts, setAccounts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [tags, setTags]               = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const loadAccounts = useCallback(async () => {
    try {
      const res = await accountAPI.getAll();
      setAccounts(res.data.data.accounts || []);
    } catch {}
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data.data || []);
    } catch {}
  }, []);

  const loadTags = useCallback(async () => {
    try {
      const res = await tagAPI.getAll();
      setTags(res.data.data || []);
    } catch {}
  }, []);

  const loadNotificationCount = useCallback(async () => {
    try {
      const res = await notificationAPI.getAll();
      setUnreadCount(res.data.data.unread || 0);
    } catch {}
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadAccounts(), loadCategories(), loadTags(), loadNotificationCount()]);
  }, [loadAccounts, loadCategories, loadTags, loadNotificationCount]);

  // Poll notifications every 60s
  useEffect(() => {
    if (!user) return;
    loadNotificationCount();
    const interval = setInterval(loadNotificationCount, 60000);
    return () => clearInterval(interval);
  }, [user, loadNotificationCount]);

  return (
    <AppContext.Provider value={{
      accounts, setAccounts,
      categories, setCategories,
      tags, setTags,
      unreadCount, setUnreadCount,
      loadAll,
      loadAccounts,
      loadCategories,
      loadTags,
      // aliases so older components don't break
      fetchAccounts: loadAccounts,
      fetchCategories: loadCategories,
      fetchTags: loadTags,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);