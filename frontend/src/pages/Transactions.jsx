import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download, Trash2, Edit2, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, CheckSquare, Square } from 'lucide-react';
import { transactionAPI } from '../services/api';
import { getDateRange, formatCurrency } from '../utils/helpers';
import { useApp } from '../contexts/AppContext';
import FilterBar from '../components/common/FilterBar';
import TransactionModal from '../components/transactions/TransactionModal';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';
import TxIcon from '../components/transactions/TxIcon';
import toast from 'react-hot-toast';
import { format, isToday, isYesterday } from 'date-fns';

/* ─── helpers ──────────────────────────────────────────────────────────────── */
const fmtAmt = (n) => Math.abs(n).toLocaleString('en-BD', { minimumFractionDigits: 2 });

function groupByDate(txList) {
  const groups = {};
  txList.forEach(tx => {
    const d = format(new Date(tx.date), 'yyyy-MM-dd');
    if (!groups[d]) groups[d] = [];
    groups[d].push(tx);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

function dateLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d))     return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMMM d, yyyy');
}

function dayNet(txs) {
  return txs.reduce((sum, tx) => {
    if (tx.type === 'income')  return sum + tx.amount;
    if (tx.type === 'expense') return sum - tx.amount;
    return sum;
  }, 0);
}

/* ─── Single Row ───────────────────────────────────────────────────────────── */
function TxRow({ tx, selected, onToggle, onEdit, onDelete }) {
  const isIncome   = tx.type === 'income';
  const isExpense  = tx.type === 'expense';
  const isTransfer = tx.type === 'transfer';

  const amtColor = isIncome ? 'text-emerald-600 dark:text-emerald-400'
    : isExpense ? 'text-red-500 dark:text-red-400'
    : 'text-amber-500 dark:text-amber-400';

  const sign = isIncome ? '+BDT ' : isExpense ? '-BDT ' : 'BDT ';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-colors group ${selected ? 'bg-primary-50 dark:bg-primary-900/10' : 'hover:bg-surface-50 dark:hover:bg-surface-800/40'}`}>
      {/* Checkbox */}
      <button onClick={() => onToggle(tx._id)} className="shrink-0 text-surface-300 hover:text-primary-500 transition-colors">
        {selected
          ? <CheckSquare size={16} className="text-primary-500" />
          : <Square size={16} />}
      </button>

      {/* Icon */}
      <TxIcon icon={tx.category?.icon} color={tx.category?.color} type={tx.type} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
            {tx.category?.name || tx.type}
          </p>
          {tx.status === 'uncleared'  && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" title="Uncleared" />}
          {tx.status === 'reconciled' && <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0"  title="Reconciled" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {/* Account */}
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full shrink-0`}
              style={{ backgroundColor: tx.account?.color || '#94a3b8' }} />
            <p className="text-xs text-surface-400">{tx.account?.name}</p>
          </div>
          {/* Note / Payer */}
          {(tx.note || tx.payer) && (
            <>
              <span className="text-surface-300 dark:text-surface-600 text-xs">•</span>
              <p className="text-xs text-surface-400 truncate max-w-[140px]">{tx.payer || tx.note}</p>
            </>
          )}
          {/* Transfer to */}
          {isTransfer && tx.toAccount && (
            <>
              <ArrowLeftRight size={10} className="text-surface-400" />
              <p className="text-xs text-surface-400">{tx.toAccount.name}</p>
            </>
          )}
        </div>
        {/* Tags */}
        {tx.tags?.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {tx.tags.map((tag, i) => (
              <span key={tag._id || i} className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: tag.color }}>{tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Amount + time */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold font-mono ${amtColor}`}>
          {sign}{fmtAmt(tx.amount)}
        </p>
        <p className="text-[11px] text-surface-400 mt-0.5">{format(new Date(tx.date), 'h:mm a')}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => onEdit(tx)}
          className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-surface-400 hover:text-primary-500 transition-colors">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(tx)}
          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────────── */
export default function Transactions() {
  const { accounts, fetchAccounts } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [pages,   setPages]   = useState(1);
  const [search,  setSearch]  = useState('');
  const [showModal,  setShowModal]  = useState(false);
  const [editingTx,  setEditingTx]  = useState(null);
  const [selected,   setSelected]   = useState([]);   // multi-select ids
  const [deleting,   setDeleting]   = useState(false);
  const [filters, setFilters] = useState({ datePreset: 'this_month', type: '', account: '' });

  const fetchTx = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { start, end } = filters.startDate
        ? { start: filters.startDate, end: filters.endDate }
        : getDateRange(filters.datePreset || 'this_month');
      const res = await transactionAPI.getAll({
        page: p, limit: 50,
        type: filters.type, account: filters.account,
        startDate: start?.toISOString(), endDate: end?.toISOString(), search,
      });
      setTransactions(res.data.data.transactions);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setSummary(res.data.data.summary);
      setSelected([]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, search]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchTx(1); setPage(1); }, [filters, search]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── selection helpers ── */
  const toggleOne = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(s => s.length === transactions.length ? [] : transactions.map(t => t._id));

  /* ── single delete ── */
  const handleDelete = async (tx) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await transactionAPI.delete(tx._id); toast.success('Deleted'); fetchTx(page); fetchAccounts(); }
    catch { toast.error('Failed to delete'); }
  };

  /* ── multi delete ── */
  const handleMultiDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} transactions?`)) return;
    setDeleting(true);
    try {
      await Promise.all(selected.map(id => transactionAPI.delete(id)));
      toast.success(`${selected.length} transactions deleted`);
      fetchTx(page); fetchAccounts();
    } catch { toast.error('Some deletions failed'); }
    finally { setDeleting(false); }
  };

  const handleEdit = (tx) => { setEditingTx(tx); setShowModal(true); };

  const income  = summary.find(s => s._id === 'income')?.total  || 0;
  const expense = summary.find(s => s._id === 'expense')?.total || 0;
  const grouped = groupByDate(transactions);

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-surface-400 mt-0.5">Found {total} records</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost border border-surface-200 dark:border-surface-700 text-sm">
            <Download size={14} /> Export
          </button>
          <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="btn-primary text-sm">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Income',  value: income,           cls: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Expense', value: expense,          cls: 'text-red-500 dark:text-red-400'         },
          { label: 'Net',     value: income - expense, cls: income - expense >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="card p-3 text-center">
            <p className="text-[11px] font-semibold text-surface-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-base font-bold font-mono mt-0.5 ${s.cls}`}>
              {s.value < 0 ? '-' : ''}৳{Math.abs(s.value).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search notes, payer..." className="input pl-9 text-sm" />
        </div>
        <FilterBar filters={filters} onChange={setFilters} accounts={accounts} />
      </div>

      {/* ── Multi-select toolbar ── */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl"
          style={{ background: 'rgba(97,117,244,0.1)', border: '1px solid rgba(97,117,244,0.2)' }}>
          <div className="flex items-center gap-3">
            <button onClick={toggleAll} className="text-xs text-primary-500 font-semibold hover:underline">
              {selected.length === transactions.length ? 'Deselect all' : 'Select all'}
            </button>
            <span className="text-xs text-surface-500">{selected.length} selected</span>
          </div>
          <button onClick={handleMultiDelete} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors disabled:opacity-50">
            <Trash2 size={12} />
            {deleting ? 'Deleting...' : `Delete ${selected.length}`}
          </button>
        </div>
      )}

      {/* ── Transaction List ── */}
      {loading ? <Skeleton rows={8} /> : transactions.length === 0 ? (
        <EmptyState icon="💸" title="No transactions found"
          description="Try adjusting your filters or add a new transaction."
          action={<button onClick={() => setShowModal(true)} className="btn-primary">Add Transaction</button>} />
      ) : (
        <div className="space-y-3">
          {/* Select all row */}
          <div className="flex items-center gap-2 px-1">
            <button onClick={toggleAll} className="flex items-center gap-2 text-xs text-surface-400 hover:text-surface-600 transition-colors">
              {selected.length === transactions.length && transactions.length > 0
                ? <CheckSquare size={14} className="text-primary-500" />
                : <Square size={14} />}
              Select all
            </button>
          </div>

          {/* Grouped by date */}
          {grouped.map(([dateStr, txs]) => {
            const net = dayNet(txs);
            return (
              <div key={dateStr} className="card overflow-hidden">
                {/* Date header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-surface-100 dark:border-surface-700/50"
                  style={{ background: 'rgba(100,116,139,0.05)' }}>
                  <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
                    {dateLabel(dateStr)}
                  </span>
                  <span className={`text-xs font-bold font-mono ${net >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {net >= 0 ? '+' : ''}BDT {net.toLocaleString('en-BD', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Transactions */}
                <div className="divide-y divide-surface-50 dark:divide-surface-800/30">
                  {txs.map(tx => (
                    <TxRow key={tx._id} tx={tx}
                      selected={selected.includes(tx._id)}
                      onToggle={toggleOne}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: Math.min(pages, 7) }).map((_, i) => (
            <button key={i} onClick={() => { setPage(i + 1); fetchTx(i + 1); }}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === i + 1
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 border border-surface-200 dark:border-surface-700 hover:border-primary-400'
              }`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <TransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingTx(null); }}
        transaction={editingTx}
        onSuccess={() => { fetchTx(page); fetchAccounts(); }}
      />
    </div>
  );
}