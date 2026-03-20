import React from 'react';

const variants = {
  income: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  expense: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  transfer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  cleared: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  uncleared: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400',
  reconciled: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  closed: 'bg-surface-100 text-surface-500 dark:bg-surface-700 dark:text-surface-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
};

export default function Badge({ variant = 'primary', children, className = '' }) {
  return (
    <span className={`badge ${variants[variant] || variants.primary} ${className}`}>{children}</span>
  );
}
