import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpDown, Wallet } from 'lucide-react';

const icons = {
  balance: Wallet,
  income: TrendingUp,
  expense: TrendingDown,
  savings: ArrowUpDown,
};

const colors = {
  balance: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  income: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  expense: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  savings: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
};

const SummaryCard = ({ type, title, amount, subtitle, loading }) => {
  const Icon = icons[type];
  if (loading) return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-10 w-10 rounded-xl" />
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-7 w-32" />
    </div>
  );

  const isNegative = type === 'savings' && amount < 0;

  return (
    <div className="card-hover p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[type]}`}>
        <Icon size={20} />
      </div>
      <p className="text-sm text-[var(--text2)] font-medium">{title}</p>
      <p className={`text-2xl font-bold font-mono mt-1 ${isNegative ? 'text-red-500' : 'text-[var(--text)]'}`}>
        ৳{Math.abs(amount || 0).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
      </p>
      {subtitle && <p className="text-xs text-[var(--text3)] mt-1">{subtitle}</p>}
    </div>
  );
};

export default SummaryCard;
