import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { accountAPI } from '../../services/api';
import { useApp } from '../../contexts/AppContext';
import { ACCOUNT_TYPES, COLORS } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ACCOUNT_ICONS = { General:'💳', Cash:'💵', Checking:'🏦', Credit:'💳', Savings:'🐷', Bonus:'🎁', Insurance:'🛡️', Investment:'📈', Loan:'📋', Mortgage:'🏠', Overdraft:'⚠️' };

export default function AccountModal({ isOpen, onClose, account }) {
  const { fetchAccounts } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', color: '#6366f1', type: 'General', initialBalance: 0, currency: 'BDT', excludeFromStats: false });

  useEffect(() => { if (account) setForm({ ...account }); else setForm({ name: '', color: '#6366f1', type: 'General', initialBalance: 0, currency: 'BDT', excludeFromStats: false }); }, [account, isOpen]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name) return toast.error('Account name required');
    setLoading(true);
    try {
      if (account) { await accountAPI.update(account._id, form); toast.success('Account updated'); }
      else { await accountAPI.create(form); toast.success('Account created'); }
      await fetchAccounts(); onClose();
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={account ? 'Edit Account' : 'New Account'} size="sm"
      footer={<div className="flex gap-3"><button onClick={onClose} className="btn-ghost flex-1">Cancel</button><button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">{loading ? 'Saving...' : 'Save'}</button></div>}>
      <div className="space-y-4">
        <div>
          <label className="label">Account Name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className="input" placeholder="e.g. bKash, Dutch-Bangla" />
        </div>
        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-3 gap-2">
            {ACCOUNT_TYPES.map(t => (
              <button key={t} onClick={() => set('type', t)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${form.type === t ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-900 text-surface-600 dark:text-surface-400 hover:bg-surface-200'}`}>
                {ACCOUNT_ICONS[t] || '💳'} {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Initial Balance (৳)</label>
          <input type="number" value={form.initialBalance} onChange={e => set('initialBalance', parseFloat(e.target.value)||0)} className="input font-mono" />
        </div>
        <div>
          <label className="label">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-primary-500 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.excludeFromStats} onChange={e => set('excludeFromStats', e.target.checked)} className="w-4 h-4 rounded accent-primary-600" />
          <span className="text-sm text-surface-700 dark:text-surface-300">Exclude from statistics</span>
        </label>
      </div>
    </Modal>
  );
}
