import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Wallet, TrendingUp, TrendingDown, EyeOff } from 'lucide-react';
import { accountAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import IconPicker, { LucideIcon } from '../components/common/IconPicker';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = [
  'General','Cash','Checking','Credit','Savings',
  'Bonus','Insurance','Investment','Loan','Mortgage','Overdraft'
];

const TYPE_COLORS = {
  General:'#6175f4', Cash:'#10b981', Checking:'#06b6d4',
  Credit:'#f59e0b', Savings:'#8b5cf6', Bonus:'#ec4899',
  Insurance:'#14b8a6', Investment:'#f97316', Loan:'#ef4444',
  Mortgage:'#dc2626', Overdraft:'#b91c1c'
};

const TYPE_DEFAULT_ICONS = {
  General:'Wallet', Cash:'Banknote', Checking:'Building',
  Credit:'CreditCard', Savings:'PiggyBank', Bonus:'Gift',
  Insurance:'Shield', Investment:'TrendingUp', Loan:'HandCoins',
  Mortgage:'Home', Overdraft:'Receipt'
};

const PRESET_COLORS = [
  '#6175f4','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#06b6d4','#f97316','#ec4899','#14b8a6','#84cc16'
];

// ─── Form Modal ───────────────────────────────────────────────────────────────
const AccountForm = ({ isOpen, onClose, onSuccess, editData }) => {
  const getDefault = () => ({
    name:'', color:'#6175f4', icon:'Wallet',
    type:'General', initialBalance:0, currency:'BDT', excludeFromStats:false
  });

  const [form, setForm] = useState(getDefault());
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setForm(editData ? {
      name: editData.name || '',
      color: editData.color || '#6175f4',
      icon: editData.icon || 'Wallet',
      type: editData.type || 'General',
      initialBalance: editData.initialBalance || 0,
      currency: editData.currency || 'BDT',
      excludeFromStats: editData.excludeFromStats || false,
    } : getDefault());
  }, [isOpen, editData]);

  const handleTypeChange = (type) => {
    setForm(f => ({
      ...f,
      type,
      color: TYPE_COLORS[type] || f.color,
      icon: TYPE_DEFAULT_ICONS[type] || f.icon,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Account name is required');
    setLoading(true);
    try {
      if (editData) { await accountAPI.update(editData._id, form); toast.success('Account updated!'); }
      else { await accountAPI.create(form); toast.success('Account created!'); }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Account' : 'New Account'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Icon Picker */}
        <IconPicker
          value={form.icon}
          onChange={icon => setForm(f => ({ ...f, icon }))}
          label="Icon"
        />

        {/* Name */}
        <div>
          <label className="label">Account Name *</label>
          <input
            className="input"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. bKash, Dutch-Bangla, Cash Wallet"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="label">Account Type</label>
          <select className="input" value={form.type} onChange={e => handleTypeChange(e.target.value)}>
            {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="label">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer p-1 bg-[var(--bg3)]"
            />
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-[var(--text3)] scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* Initial Balance — create only */}
        {!editData && (
          <div>
            <label className="label">Initial Balance (৳)</label>
            <input type="number" step="0.01" className="input font-mono"
              value={form.initialBalance}
              onChange={e => setForm(f => ({ ...f, initialBalance: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00" />
          </div>
        )}

        {/* Exclude toggle */}
        <div className="flex items-center justify-between p-3 bg-[var(--bg3)] rounded-xl">
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Exclude from Statistics</p>
            <p className="text-xs text-[var(--text3)]">Won't count in balance & reports</p>
          </div>
          <button type="button"
            onClick={() => setForm(f => ({ ...f, excludeFromStats: !f.excludeFromStats }))}
            className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${form.excludeFromStats ? 'bg-primary-600' : 'bg-[var(--border2)]'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.excludeFromStats ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Saving...' : editData ? 'Update Account' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Account Card ─────────────────────────────────────────────────────────────
const AccountCard = ({ account, onEdit, onDelete }) => (
  <div className="card-hover p-5 group relative overflow-hidden">
    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: account.color }} />
    <div className="flex items-start justify-between mt-1">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: account.color + '22' }}>
          <LucideIcon name={account.icon} size={20} className="text-[var(--text)]" />
        </div>
        <div>
          <p className="font-bold text-[var(--text)] leading-tight">{account.name}</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: account.color + '22', color: account.color }}>
            {account.type}
          </span>
        </div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(account)} title="Edit"
          className="p-1.5 hover:bg-[var(--bg3)] rounded-lg text-[var(--text3)] hover:text-[var(--text)] transition-colors">
          <Edit2 size={14} />
        </button>
        <button onClick={() => onDelete(account)} title="Delete"
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-[var(--text3)] hover:text-red-500 transition-colors">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
    <div className="mt-4">
      <p className="text-xs text-[var(--text3)] mb-0.5">Current Balance</p>
      <p className={`text-2xl font-black font-mono ${account.currentBalance < 0 ? 'text-red-500' : 'text-[var(--text)]'}`}>
        {account.currentBalance < 0 ? '-' : ''}৳{Math.abs(account.currentBalance).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
      </p>
    </div>
    {account.excludeFromStats && (
      <div className="flex items-center gap-1 mt-2 text-xs text-[var(--text3)]">
        <EyeOff size={11} /><span>Excluded from stats</span>
      </div>
    )}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const Accounts = () => {
  const { accounts, loadAccounts } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editAcc, setEditAcc] = useState(null);
  const [deleteAcc, setDeleteAcc] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteAcc) return;
    setDeleting(true);
    try {
      await accountAPI.delete(deleteAcc._id);
      toast.success(`"${deleteAcc.name}" deleted`);
      setDeleteAcc(null);
      await loadAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — account has transactions');
      setDeleteAcc(null);
    } finally { setDeleting(false); }
  };

  const included = accounts.filter(a => !a.excludeFromStats);
  const totalBalance = included.reduce((s, a) => s + a.currentBalance, 0);
  const totalAssets = included
    .filter(a => ['Savings','Checking','Cash','General','Investment','Bonus'].includes(a.type))
    .reduce((s, a) => s + Math.max(0, a.currentBalance), 0);
  const totalLiabilities = included
    .filter(a => ['Credit','Loan','Mortgage','Overdraft'].includes(a.type))
    .reduce((s, a) => s + Math.abs(Math.min(0, a.currentBalance)), 0);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-[var(--text)]">Accounts</h1>
        <button onClick={() => { setEditAcc(null); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Account
        </button>
      </div>

      {/* Net Worth */}
      <div className="card p-5 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <p className="text-xs font-semibold text-primary-200 uppercase tracking-widest">Net Worth</p>
        <p className="text-4xl font-black font-mono mt-1">
          ৳{totalBalance.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex gap-8 mt-4">
          <div>
            <p className="text-xs text-primary-200 flex items-center gap-1"><TrendingUp size={12} /> Assets</p>
            <p className="text-lg font-bold font-mono text-emerald-300">৳{totalAssets.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-primary-200 flex items-center gap-1"><TrendingDown size={12} /> Liabilities</p>
            <p className="text-lg font-bold font-mono text-red-300">৳{totalLiabilities.toLocaleString('en-BD', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        <EmptyState icon={Wallet} title="No accounts yet"
          description="Add your bank accounts, bKash, cash wallet, or any other accounts."
          action={<button onClick={() => { setEditAcc(null); setShowForm(true); }} className="btn-primary text-sm">Add Your First Account</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <AccountCard key={acc._id} account={acc}
              onEdit={a => { setEditAcc(a); setShowForm(true); }}
              onDelete={setDeleteAcc} />
          ))}
        </div>
      )}

      <AccountForm isOpen={showForm} onClose={() => { setShowForm(false); setEditAcc(null); }}
        onSuccess={loadAccounts} editData={editAcc} />

      <ConfirmDialog isOpen={!!deleteAcc} onClose={() => setDeleteAcc(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message={`"${deleteAcc?.name}" delete করবেন? Transaction থাকলে delete করা যাবে না।`}
        confirmLabel={deleting ? 'Deleting...' : 'Delete Account'}
        danger={true} />
    </div>
  );
};

export default Accounts;