import React from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2, ArrowRight } from 'lucide-react';
import TxIcon from './TxIcon';

const STATUS_STYLES = {
  cleared:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  uncleared:  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  reconciled: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
};

const TransactionItem = ({ tx, onEdit, onDelete }) => {
  const isTransfer = tx.type === 'transfer';
  const isIncome   = tx.type === 'income';
  const isExpense  = tx.type === 'expense';

  const amtColor = isIncome
    ? 'text-emerald-600 dark:text-emerald-400'
    : isExpense
      ? 'text-red-500 dark:text-red-400'
      : 'text-blue-500 dark:text-blue-400';

  const sign = isIncome ? '+' : isExpense ? '-' : '';

  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg3)] transition-colors group">
      {/* Icon */}
      <TxIcon icon={tx.category?.icon} color={tx.category?.color} type={tx.type} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-[var(--text)] truncate">
            {tx.note || tx.category?.name || tx.type}
          </p>
          {tx.status && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[tx.status] || ''}`}>
              {tx.status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <p className="text-xs text-[var(--text3)]">{tx.account?.name}</p>
          {isTransfer && tx.toAccount && (
            <>
              <ArrowRight size={10} className="text-[var(--text3)]" />
              <p className="text-xs text-[var(--text3)]">{tx.toAccount.name}</p>
            </>
          )}
          <span className="text-[var(--text3)] text-xs">·</span>
          <p className="text-xs text-[var(--text3)]">
            {format(new Date(tx.date), 'MMM d, h:mm a')}
          </p>
          {tx.tags?.length > 0 && (
            <>
              <span className="text-[var(--text3)] text-xs">·</span>
              {tx.tags.slice(0, 2).map(t => (
                <span key={t._id} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium text-white"
                  style={{ backgroundColor: t.color }}>
                  {t.name}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Amount + actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`font-mono font-bold text-sm ${amtColor}`}>
          {sign}৳{Math.abs(tx.amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
        </span>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(tx)}
            className="p-1.5 hover:bg-[var(--border)] rounded-lg text-[var(--text3)] hover:text-[var(--text)] transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={() => onDelete(tx)}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-[var(--text3)] hover:text-red-500 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;