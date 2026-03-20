import React from 'react';
import { Edit2, Trash2, EyeOff, Wallet, CreditCard, Banknote, TrendingUp, Building, Shield, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

const typeIcons = { Cash: Banknote, Checking: Building, Credit: CreditCard, Savings: PiggyBank, Investment: TrendingUp, Insurance: Shield };

export default function AccountCard({ account, onEdit, onDelete }) {
  const Icon = typeIcons[account.type] || Wallet;
  const isNegative = account.currentBalance < 0;

  return (
    <div className="card card-hover p-5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-5 -translate-y-8 translate-x-8"
        style={{ backgroundColor: account.color || '#6366f1' }} />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: account.color || '#6366f1' }}>
            <Icon size={18} />
          </div>
          <div>
            <p className="font-semibold text-surface-800 dark:text-surface-100">{account.name}</p>
            <p className="text-xs text-surface-400">{account.type}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(account)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600 transition-colors"><Edit2 size={13} /></button>
          <button onClick={() => onDelete(account)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
        </div>
      </div>
      <p className={`text-2xl font-bold font-mono ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-surface-900 dark:text-white'}`}>
        {isNegative ? '-' : ''}{formatCurrency(account.currentBalance)}
      </p>
      <p className="text-xs text-surface-400 mt-1">Initial: {formatCurrency(account.initialBalance)}</p>
      {account.excludeFromStats && <div className="absolute bottom-3 right-3"><EyeOff size={12} className="text-surface-300 dark:text-surface-600" /></div>}
    </div>
  );
}
