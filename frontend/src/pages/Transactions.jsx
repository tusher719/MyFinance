import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Download } from 'lucide-react';
import { transactionAPI } from '../services/api';
import { getDateRange } from '../utils/helpers';
import { useApp } from '../contexts/AppContext';
import FilterBar from '../components/common/FilterBar';
import TransactionRow from '../components/transactions/TransactionRow';
import TransactionModal from '../components/transactions/TransactionModal';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';
import toast from 'react-hot-toast';

export default function Transactions() {
  const { accounts, fetchAccounts } = useApp();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [filters, setFilters] = useState({ datePreset: 'this_month', type: '', account: '' });

  const fetchTx = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const { start, end } = filters.startDate ? { start: filters.startDate, end: filters.endDate } : getDateRange(filters.datePreset || 'this_month');
      const res = await transactionAPI.getAll({ page: p, limit: 30, type: filters.type, account: filters.account, startDate: start?.toISOString(), endDate: end?.toISOString(), search });
      setTransactions(res.data.data.transactions);
      setTotal(res.data.data.total);
      setPages(res.data.data.pages);
      setSummary(res.data.data.summary);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters, search]);

  useEffect(() => { fetchTx(1); setPage(1); }, [filters, search]);

  const handleEdit = (tx) => { setEditingTx(tx); setShowModal(true); };
  const handleDelete = async (tx) => {
    if (!window.confirm('Delete this transaction?')) return;
    try { await transactionAPI.delete(tx._id); toast.success('Deleted'); fetchTx(page); fetchAccounts(); }
    catch (e) { toast.error('Failed to delete'); }
  };

  const income = summary.find(s => s._id === 'income')?.total || 0;
  const expense = summary.find(s => s._id === 'expense')?.total || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-surface-400 mt-0.5">{total} records found</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost border border-surface-200 dark:border-surface-700"><Download size={15} /> Export</button>
          <button onClick={() => { setEditingTx(null); setShowModal(true); }} className="btn-primary"><Plus size={15} /> Add</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Income', value: income, cls: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Expense', value: expense, cls: 'text-red-600 dark:text-red-400' },
          { label: 'Net', value: income - expense, cls: income - expense >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600 dark:text-red-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-lg font-bold font-mono mt-1 ${s.cls}`}>৳{Math.abs(s.value).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="input pl-9" />
        </div>
        <FilterBar filters={filters} onChange={setFilters} accounts={accounts} />
      </div>

      {/* Transaction List */}
      <div className="card overflow-hidden">
        {loading ? <Skeleton rows={8} /> : transactions.length === 0 ? (
          <EmptyState icon="💸" title="No transactions found" description="Try adjusting your filters or add a new transaction." action={<button onClick={() => setShowModal(true)} className="btn-primary">Add Transaction</button>} />
        ) : (
          <div className="divide-y divide-surface-50 dark:divide-surface-800/50">
            {transactions.map(tx => <TransactionRow key={tx._id} transaction={tx} onEdit={handleEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.min(pages, 7) }).map((_, i) => (
            <button key={i} onClick={() => { setPage(i+1); fetchTx(i+1); }}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === i+1 ? 'bg-primary-600 text-white' : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700'}`}>
              {i+1}
            </button>
          ))}
        </div>
      )}

      <TransactionModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingTx(null); }} transaction={editingTx} onSuccess={() => { fetchTx(page); fetchAccounts(); }} />
    </div>
  );
}
