import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Calculator as CalcIcon, ChevronDown, Search, X, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Calculator from '../common/Calculator';
import { LucideIcon } from '../common/IconPicker';
import { transactionAPI } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';

const PAYMENT_TYPES = ['Cash', 'Card', 'Bank Transfer', 'Mobile Banking', 'Cheque', 'Other'];
const STATUSES = [
  { value: 'cleared',    label: 'Cleared',    color: 'text-emerald-500' },
  { value: 'uncleared',  label: 'Uncleared',  color: 'text-amber-500'   },
  { value: 'reconciled', label: 'Reconciled', color: 'text-primary-500' },
];

const TYPE_COLORS = {
  expense:  { bg: 'bg-red-50 dark:bg-red-950/30',     border: 'border-red-200 dark:border-red-900/50',     tab: 'bg-red-500 text-white',     pill: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'     },
  income:   { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900/50', tab: 'bg-emerald-500 text-white', pill: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  transfer: { bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-900/50',   tab: 'bg-blue-500 text-white',    pill: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'   },
};

const clean = (val) => (val && val !== '' ? val : undefined);
const LS_TYPE_KEY = 'wos_last_tx_type';
const LS_ACCT_KEY = 'wos_last_tx_account';

// ─── Tags Dropdown ─────────────────────────────────────────────────────────────
const TagsDropdown = ({ tags, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const filtered = tags.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  const selectedTags = tags.filter(t => selected.includes(t._id));

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="input flex items-center gap-2 min-h-[42px] flex-wrap cursor-pointer hover:border-primary-500 transition-colors"
      >
        {selectedTags.length === 0 ? (
          <span className="text-[var(--text3)] text-sm">Select tags...</span>
        ) : (
          selectedTags.map(t => (
            <span key={t._id} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: t.color }}>
              {t.name}
              <span onClick={(e) => { e.stopPropagation(); toggle(t._id); }} className="hover:opacity-70 cursor-pointer">
                <X size={10} />
              </span>
            </span>
          ))
        )}
        <ChevronDown size={14} className={`text-[var(--text3)] ml-auto shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-[var(--border)] shadow-modal overflow-hidden animate-scale-in"
          style={{ backgroundColor: 'var(--bg2)' }}>
          <div className="p-2 border-b border-[var(--border)]">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text3)]" />
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                className="input pl-7 py-1.5 text-sm" placeholder="Search tags..." />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-center text-xs text-[var(--text3)] py-4">No tags found</p>
            ) : filtered.map(t => (
              <button key={t._id} type="button" onClick={() => toggle(t._id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-[var(--bg3)] transition-colors">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span className="text-sm text-[var(--text)] flex-1 text-left">{t.name}</span>
                {selected.includes(t._id) && <Check size={14} className="text-primary-500 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Form ─────────────────────────────────────────────────────────────────
const TransactionForm = ({ isOpen, onClose, onSuccess, editData }) => {
  const { accounts, categories, tags, loadAccounts } = useApp();

  const savedType = localStorage.getItem(LS_TYPE_KEY) || 'expense';
  const savedAcct = localStorage.getItem(LS_ACCT_KEY) || '';

  const [type, setType] = useState(savedType);
  const [form, setForm] = useState({
    amount: '', account: '', toAccount: '', category: '',
    tags: [], note: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    paymentType: 'Cash', status: 'cleared',
  });
  const [showCalc, setShowCalc] = useState(false);
  const [loading, setLoading] = useState(false);

  // Persist type selection
  const handleTypeChange = (t) => {
    setType(t);
    localStorage.setItem(LS_TYPE_KEY, t);
  };

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      setType(editData.type);
      setForm({
        amount: editData.amount || '',
        account: editData.account?._id || '',
        toAccount: editData.toAccount?._id || '',
        category: editData.category?._id || '',
        tags: editData.tags?.map(t => t._id) || [],
        note: editData.note || '',
        date: format(new Date(editData.date), "yyyy-MM-dd'T'HH:mm"),
        paymentType: editData.paymentType || 'Cash',
        status: editData.status || 'cleared',
      });
    } else {
      const lastAcct = savedAcct || accounts[0]?._id || '';
      setType(savedType);
      setForm({
        amount: '',
        account: lastAcct,
        toAccount: '', category: '', tags: [],
        note: '',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        paymentType: 'Cash', status: 'cleared',
      });
      setShowCalc(false);
    }
  }, [isOpen, editData]);

  // Persist account selection
  useEffect(() => {
    if (form.account) localStorage.setItem(LS_ACCT_KEY, form.account);
  }, [form.account]);

  const flatCategories = (cats, depth = 0) =>
    cats.flatMap(c => [{ ...c, depth }, ...(c.children ? flatCategories(c.children, depth + 1) : [])]);
  const allCats = flatCategories(categories);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0)  return toast.error('Enter a valid amount');
    if (!form.account)     return toast.error('Select an account');
    if (type === 'transfer' && !form.toAccount) return toast.error('Select destination account');

    setLoading(true);
    try {
      const payload = {
        type, amount: amt,
        account:   form.account,
        toAccount: clean(form.toAccount),
        category:  clean(form.category),
        tags:      form.tags.filter(Boolean),
        note:      form.note,
        date:      form.date,
        paymentType: form.paymentType,
        status:    form.status,
      };

      if (editData) await transactionAPI.update(editData._id, payload);
      else          await transactionAPI.create(payload);

      // Refresh account balances
      await loadAccounts();

      toast.success(editData ? 'Transaction updated!' : 'Transaction added!');
      onSuccess?.();

      // Reset form but keep type + account
      setForm(f => ({
        amount: '', account: f.account, toAccount: '', category: '',
        tags: [], note: '',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        paymentType: f.paymentType, status: 'cleared',
      }));
      setShowCalc(false);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving transaction');
    } finally { setLoading(false); }
  };

  const tc = TYPE_COLORS[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaction' : 'New Transaction'} size="md">
      {/* Colored bg wrapper */}
      <div className={`-mx-5 -mt-2 px-5 pb-5 pt-3 rounded-b-2xl transition-colors duration-300 ${tc.bg}`}>
        <form onSubmit={handleSubmit} className="space-y-3.5">

          {/* Type tabs */}
          <div className={`flex bg-white/40 dark:bg-black/20 rounded-xl p-1 border ${tc.border}`}>
            {['expense', 'income', 'transfer'].map(t => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                  type === t ? tc.tab : 'text-[var(--text2)] hover:text-[var(--text)]'
                }`}>
                {t}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div>
            <label className="label">Amount (৳)</label>
            <div className="relative">
              <input
                type="number" min="0" step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="input pr-10 text-2xl font-mono font-black bg-white/60 dark:bg-black/20"
                placeholder="0.00"
                autoFocus
              />
              <button type="button" onClick={() => setShowCalc(!showCalc)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text3)] hover:text-primary-500">
                <CalcIcon size={18} />
              </button>
            </div>
            {showCalc && (
              <div className="mt-2">
                <Calculator value={parseFloat(form.amount) || 0} onChange={v => setForm(f => ({ ...f, amount: v }))} />
              </div>
            )}
          </div>

          {/* Account(s) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{type === 'transfer' ? 'From Account' : 'Account'}</label>
              <select value={form.account} onChange={e => setForm(f => ({ ...f, account: e.target.value }))}
                className="input bg-white/60 dark:bg-black/20">
                <option value="">Select account</option>
                {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
              </select>
            </div>
            {type === 'transfer' ? (
              <div>
                <label className="label">To Account</label>
                <select value={form.toAccount} onChange={e => setForm(f => ({ ...f, toAccount: e.target.value }))}
                  className="input bg-white/60 dark:bg-black/20">
                  <option value="">Select account</option>
                  {accounts.filter(a => a._id !== form.account).map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="input bg-white/60 dark:bg-black/20">
                  <option value="">No category</option>
                  {allCats.map(c => (
                    <option key={c._id} value={c._id}>
                      {'— '.repeat(c.depth)}{c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date & Payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date & Time (BDT)</label>
              <input type="datetime-local" value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="input bg-white/60 dark:bg-black/20" />
            </div>
            <div>
              <label className="label">Payment Type</label>
              <select value={form.paymentType} onChange={e => setForm(f => ({ ...f, paymentType: e.target.value }))}
                className="input bg-white/60 dark:bg-black/20">
                {PAYMENT_TYPES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Status dropdown */}
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="input bg-white/60 dark:bg-black/20">
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Tags popup */}
          {tags.length > 0 && (
            <div>
              <label className="label">Tags</label>
              <TagsDropdown tags={tags} selected={form.tags} onChange={v => setForm(f => ({ ...f, tags: v }))} />
            </div>
          )}

          {/* Note */}
          <div>
            <label className="label">Note</label>
            <input type="text" value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              className="input bg-white/60 dark:bg-black/20" placeholder="Add a note..." />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 bg-white/60 dark:bg-black/20">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all ${tc.tab} disabled:opacity-50`}>
              {loading ? 'Saving...' : editData ? 'Update' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default TransactionForm;