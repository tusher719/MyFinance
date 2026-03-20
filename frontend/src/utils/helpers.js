import { format, formatDistanceToNow, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';

export const formatCurrency = (amount, currency = 'BDT') => {
  const symbols = { BDT: '৳', USD: '$', EUR: '€', GBP: '£' };
  const sym = symbols[currency] || currency;
  const abs = Math.abs(amount || 0);
  if (abs >= 10000000) return `${sym}${(abs/10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${sym}${(abs/100000).toFixed(2)}L`;
  if (abs >= 1000) return `${sym}${(abs/1000).toFixed(1)}K`;
  return `${sym}${abs.toFixed(2)}`;
};

export const formatDate = (date, fmt = 'dd MMM yyyy') => { if (!date) return ''; return format(new Date(date), fmt); };
export const formatDateTime = (date) => { if (!date) return ''; return format(new Date(date), 'dd MMM yyyy, hh:mm a'); };
export const timeAgo = (date) => formatDistanceToNow(new Date(date), { addSuffix: true });

export const getDateRange = (preset) => {
  const now = new Date();
  switch (preset) {
    case 'today': return { start: new Date(new Date().setHours(0,0,0,0)), end: new Date(new Date().setHours(23,59,59,999)) };
    case 'yesterday': { const y = subDays(new Date(), 1); return { start: new Date(y.setHours(0,0,0,0)), end: new Date(new Date(subDays(new Date(),1)).setHours(23,59,59,999)) }; }
    case '7d': return { start: subDays(new Date(), 7), end: new Date() };
    case '30d': return { start: subDays(new Date(), 30), end: new Date() };
    case 'this_month': return { start: startOfMonth(now), end: endOfMonth(now) };
    case 'last_month': { const lm = subMonths(now, 1); return { start: startOfMonth(lm), end: endOfMonth(lm) }; }
    case 'this_week': return { start: startOfWeek(now, {weekStartsOn: 1}), end: endOfWeek(now, {weekStartsOn: 1}) };
    case 'this_year': return { start: startOfYear(now), end: endOfYear(now) };
    case '6m': return { start: subMonths(new Date(), 6), end: new Date() };
    case '1y': return { start: subMonths(new Date(), 12), end: new Date() };
    default: return { start: startOfMonth(now), end: endOfMonth(now) };
  }
};

export const typeColor = (type) => ({ income: 'text-income', expense: 'text-expense', transfer: 'text-transfer' })[type] || '';
export const typeBg = (type) => ({ income: 'bg-emerald-500/10 text-emerald-500', expense: 'bg-red-500/10 text-red-500', transfer: 'bg-amber-500/10 text-amber-500' })[type] || '';
export const typeSign = (type) => type === 'income' ? '+' : type === 'expense' ? '-' : '→';

export const ACCOUNT_TYPES = ['General', 'Cash', 'Checking', 'Credit', 'Savings', 'Bonus', 'Insurance', 'Investment', 'Loan', 'Mortgage', 'Overdraft'];
export const PAYMENT_TYPES = ['Cash', 'Card', 'Bank Transfer', 'Mobile Banking', 'Cheque', 'Other'];
export const TX_STATUSES = ['cleared', 'uncleared', 'reconciled'];
export const NATURE_TYPES = ['None', 'Must', 'Need', 'Want'];
export const DATE_PRESETS = [
  { label: 'Today', value: 'today' }, { label: 'Yesterday', value: 'yesterday' },
  { label: '7 Days', value: '7d' }, { label: '30 Days', value: '30d' },
  { label: 'This Week', value: 'this_week' }, { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' }, { label: '6 Months', value: '6m' },
  { label: 'This Year', value: 'this_year' }, { label: '1 Year', value: '1y' },
];
export const CATEGORY_ICONS = ['🍔','🚗','🏠','💊','📚','🎮','✈️','👔','💅','🐾','⚡','📱','🎬','🎵','🏋️','☕','🛒','💰','🎁','🏦','🔧','🌿','👶','💻','🎓','🙏','❤️','📁'];
export const COLORS = ['#6366f1','#8b5cf6','#ec4899','#ef4444','#f97316','#eab308','#22c55e','#10b981','#14b8a6','#06b6d4','#3b82f6','#64748b'];
