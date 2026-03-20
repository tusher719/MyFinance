import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || err);
  }
);

export default API;

// Auth
export const authAPI = {
  register: (d) => API.post('/auth/register', d),
  login: (d) => API.post('/auth/login', d),
  getMe: () => API.get('/auth/me'),
  updateProfile: (d) => API.put('/auth/profile', d),
  changePassword: (d) => API.put('/auth/password', d),
};

// Accounts
export const accountAPI = {
  getAll: () => API.get('/accounts'),
  create: (d) => API.post('/accounts', d),
  update: (id, d) => API.put(`/accounts/${id}`, d),
  delete: (id) => API.delete(`/accounts/${id}`),
};

// Transactions
export const transactionAPI = {
  getAll: (params) => API.get('/transactions', { params }),
  create: (d) => API.post('/transactions', d),
  update: (id, d) => API.put(`/transactions/${id}`, d),
  delete: (id) => API.delete(`/transactions/${id}`),
};

// Categories
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  create: (d) => API.post('/categories', d),
  update: (id, d) => API.put(`/categories/${id}`, d),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Tags
export const tagAPI = {
  getAll: () => API.get('/tags'),
  create: (d) => API.post('/tags', d),
  update: (id, d) => API.put(`/tags/${id}`, d),
  delete: (id) => API.delete(`/tags/${id}`),
};

// Budgets
export const budgetAPI = {
  getAll: (params) => API.get('/budgets', { params }),
  create: (d) => API.post('/budgets', d),
  update: (id, d) => API.put(`/budgets/${id}`, d),
  delete: (id) => API.delete(`/budgets/${id}`),
};

// Debts
export const debtAPI = {
  getAll: (params) => API.get('/debts', { params }),
  create: (d) => API.post('/debts', d),
  addPayment: (id, d) => API.post(`/debts/${id}/payments`, d),
  update: (id, d) => API.put(`/debts/${id}`, d),
  delete: (id) => API.delete(`/debts/${id}`),
};

// Stats
export const statsAPI = {
  getDashboard: () => API.get('/stats/dashboard'),
  getSpending: (params) => API.get('/stats/spending', { params }),
};

// Notifications
export const notificationAPI = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/mark-all-read'),
};
