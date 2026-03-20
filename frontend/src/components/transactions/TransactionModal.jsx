import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Calculator from '../common/Calculator';
import { useApp } from '../../contexts/AppContext';
import { transactionAPI } from '../../services/api';
import { PAYMENT_TYPES, TX_STATUSES } from '../../utils/helpers';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Calculator as CalcIcon } from 'lucide-react';

export default function TransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const { accounts, categories, tags } = useApp();
  const [tab, setTab] = useState('income');
  const [showCalc, setShowCalc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'expense', amount: 0, account: '', toAccount: '', category: '',
    tags: [], note: '', date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    paymentType: 'Cash', status: 'cleared'
  });

  useEffect(() => {
    if (transaction) {
      setForm({ ...transaction, date: format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm"), tags: transaction.tags?.map(t => t._id || t) || [], account: transaction.account?._id || transaction.account, category: transaction.category?._id || transaction.category });
      setTab(transaction.type);
    } else {
      setForm(f => ({ ...f, type: tab }));
    }
  }, [transaction, isOpen, tab]);

  const setType = (type) => { setTab(type); setForm(f => ({ ...f, type })); };
  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const toggleTag = (id) => setForm(f => ({ ...f, tags: f.tags.includes(id) ? f.tags.filter(t => t !== id) : [...f.tags, id] }));

  const flatCategories = [];
  const flatten = (cats, depth = 0) => cats.forEach(c => { flatCategories.push({...c, depth}); if (c.children) flatten(c.children, depth+1); });
  flatten(categories);

  const handleSubmit = async () => {
    if (!form.amount || form.amount <= 0) return toast.error('Enter a valid amount');
    if (!form.account) return toast.error('Select an account');
    setLoading(true);
    try {
      if (transaction) { await transactionAPI.update(transaction._id, form); toast.success('Transaction updated'); }
      else { await transactionAPI.create(form); toast.success('Transaction added'); }
      onSuccess?.(); onClose();
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const typeTabs = [
    { value: 'income', label: 'Income', color: 'text-emerald-600 dark:text-emerald-400', activeBg: 'bg-emerald-500 text-white' },
    { value: 'expense', label: 'Expense', color: 'text-red-600 dark:text-red-400', activeBg: 'bg-red-500 text-white' },
    { value: 'transfer', label: 'Transfer', color: 'text-amber-600 dark:text-amber-400', activeBg: 'bg-amber-500 text-white' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : 'New Transaction'} size="md"
      footer={
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'Saving...' : transaction ? 'Update' : 'Save'}
          </button>
        </div>
      }>
      {/* Type Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-900 rounded-xl p-1 mb-5">
        {typeTabs.map(t => (
          <button key={t.value} onClick={() => setType(t.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.value ? t.activeBg : `${t.color} hover:bg-white dark:hover:bg-surface-800`}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label className="label">Amount</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 font-semibold">৳</span>
              <input type="number" value={form.amount || ''} onChange={e => set('amount', parseFloat(e.target.value)||0)}
                className="input pl-7 font-mono font-semibold text-lg" placeholder="0.00" />
            </div>
            <button onClick={() => setShowCalc(!showCalc)} className={`btn ${showCalc ? 'btn-primary' : 'btn-ghost border border-surface-200 dark:border-surface-700'}`}>
              <CalcIcon size={16} />
            </button>
          </div>
          {showCalc && <div className="mt-2"><Calculator value={form.amount} onChange={(v) => set('amount', v)} /></div>}
        </div>

        {/* Account */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="label">Account</label>
            <select value={form.account} onChange={e => set('account', e.target.value)} className="input">
              <option value="">Select account</option>
              {accounts.map(a => <option key={a._id} value={a._id}>{a.name} — ৳{a.currentBalance?.toFixed(0)}</option>)}
            </select>
          </div>
          {form.type === 'transfer' && (
            <div>
              <label className="label">To Account</label>
              <select value={form.toAccount} onChange={e => set('toAccount', e.target.value)} className="input">
                <option value="">Select account</option>
                {accounts.filter(a => a._id !== form.account).map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Category */}
        {form.type !== 'transfer' && (
          <div>
            <label className="label">Category</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input">
              <option value="">No category</option>
              {flatCategories.map(c => (
                <option key={c._id} value={c._id}>{' '.repeat(c.depth * 2)}{c.depth > 0 ? '└ ' : ''}{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <label className="label">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map(t => (
                <button key={t._id} onClick={() => toggleTag(t._id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border-2 ${
                    form.tags.includes(t._id) ? 'border-transparent text-white' : 'border-surface-200 dark:border-surface-700 text-surface-500'
                  }`}
                  style={form.tags.includes(t._id) ? { backgroundColor: t.color } : {}}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date & Note */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Date & Time</label>
            <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="label">Payment Type</label>
            <select value={form.paymentType} onChange={e => set('paymentType', e.target.value)} className="input">
              {PAYMENT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Note</label>
          <textarea value={form.note} onChange={e => set('note', e.target.value)} className="input resize-none" rows={2} placeholder="Add a note..." />
        </div>

        <div>
          <label className="label">Status</label>
          <div className="flex gap-2">
            {TX_STATUSES.map(s => (
              <button key={s} onClick={() => set('status', s)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${form.status === s ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-900 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}