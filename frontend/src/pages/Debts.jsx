import React, { useState, useEffect } from 'react';
import { Plus, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { debtAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';

const DebtCard = ({ debt, onPayment, onEdit, onDelete }) => {
  const progress = Math.min((debt.paidAmount / debt.amount) * 100, 100);
  const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date() && debt.status !== 'closed';

  return (
    <div className={`card p-4 space-y-3 ${isOverdue ? 'border-red-200 dark:border-red-900' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${debt.type === 'lent' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            {debt.type === 'lent' ? <TrendingUp size={16} className="text-emerald-600" /> : <TrendingDown size={16} className="text-red-600" />}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-surface-800 dark:text-surface-200 truncate">{debt.name}</p>
            {debt.description && <p className="text-xs text-surface-400 truncate">{debt.description}</p>}
          </div>
        </div>
        <Badge variant={debt.status}>{debt.status}</Badge>
      </div>

      <div className="flex justify-between text-sm">
        <div><p className="text-xs text-surface-400">Total</p><p className="font-bold font-mono">{formatCurrency(debt.amount)}</p></div>
        <div className="text-center"><p className="text-xs text-surface-400">Paid</p><p className="font-bold font-mono text-emerald-600">{formatCurrency(debt.paidAmount)}</p></div>
        <div className="text-right"><p className="text-xs text-surface-400">Remaining</p><p className="font-bold font-mono text-red-500">{formatCurrency(debt.amount - debt.paidAmount)}</p></div>
      </div>

      <div className="w-full h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      {debt.dueDate && (
        <div className={`flex items-center gap-1.5 text-xs ${isOverdue ? 'text-red-500' : 'text-surface-400'}`}>
          <Calendar size={11} />
          <span>{isOverdue ? '⚠️ Overdue: ' : 'Due: '}{formatDate(debt.dueDate)}</span>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {debt.status !== 'closed' && <button onClick={() => onPayment(debt)} className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center">Add Payment</button>}
        <button onClick={() => onEdit(debt)} className="btn-ghost text-xs py-1.5 px-3 border border-surface-200 dark:border-surface-700">Edit</button>
        <button onClick={() => onDelete(debt)} className="btn-danger text-xs py-1.5 px-3">Delete</button>
      </div>
    </div>
  );
};

export default function Debts() {
  const { accounts } = useApp();
  const [debts, setDebts] = useState([]);
  const [activeTab, setActiveTab] = useState('lent');
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [editDebt, setEditDebt] = useState(null);
  const [payingDebt, setPayingDebt] = useState(null);
  const [form, setForm] = useState({ type: 'lent', name: '', description: '', account: '', amount: '', dueDate: '' });
  const [payForm, setPayForm] = useState({ amount: '', note: '', createTransaction: false, accountId: '' });

  const fetchDebts = async () => {
    try { const res = await debtAPI.getAll(); setDebts(res.data.data); } catch {}
  };

  useEffect(() => { fetchDebts(); }, []);

  const filtered = debts.filter(d => d.type === activeTab);
  const totalLent = debts.filter(d => d.type === 'lent' && d.status === 'active').reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const totalBorrowed = debts.filter(d => d.type === 'borrowed' && d.status === 'active').reduce((s, d) => s + (d.amount - d.paidAmount), 0);

  const handleSave = async () => {
    if (!form.name || !form.amount) return toast.error('Fill required fields');
    try {
      const data = { ...form, amount: parseFloat(form.amount), type: activeTab };
      if (editDebt) { await debtAPI.update(editDebt._id, data); toast.success('Updated'); }
      else { await debtAPI.create(data); toast.success('Added'); }
      fetchDebts(); setShowModal(false); setEditDebt(null);
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  const handlePayment = async () => {
    if (!payForm.amount) return toast.error('Enter amount');
    try {
      await debtAPI.addPayment(payingDebt._id, { ...payForm, amount: parseFloat(payForm.amount) });
      toast.success('Payment recorded'); fetchDebts(); setShowPayModal(false);
    } catch (e) { toast.error(e.message || 'Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Debts</h1>
        <button onClick={() => { setEditDebt(null); setForm({ type: activeTab, name: '', description: '', account: '', amount: '', dueDate: '' }); setShowModal(true); }} className="btn-primary"><Plus size={15} /> Add</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 border-l-4 border-emerald-500">
          <p className="text-xs text-surface-400 mb-1">I Lent (Active)</p>
          <p className="text-xl font-bold font-mono text-emerald-600">{formatCurrency(totalLent)}</p>
        </div>
        <div className="card p-4 border-l-4 border-red-500">
          <p className="text-xs text-surface-400 mb-1">I Borrowed (Active)</p>
          <p className="text-xl font-bold font-mono text-red-600">{formatCurrency(totalBorrowed)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1 w-fit">
        {[{v:'lent',l:'I Lent'},{v:'borrowed',l:'I Borrowed'}].map(t => (
          <button key={t.v} onClick={() => setActiveTab(t.v)}
            className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.v ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 dark:text-surface-400'}`}>
            {t.l}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={activeTab === 'lent' ? '💸' : '🤲'} title={`No ${activeTab === 'lent' ? 'lending' : 'borrowing'} records`} description="Track money you've lent or borrowed with due dates and partial payments." action={<button onClick={() => setShowModal(true)} className="btn-primary">Add Record</button>} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(d => <DebtCard key={d._id} debt={d} onPayment={(d) => { setPayingDebt(d); setPayForm({ amount: '', note: '', createTransaction: false, accountId: '' }); setShowPayModal(true); }}
            onEdit={(d) => { setEditDebt(d); setForm({...d, account: d.account?._id||d.account, amount: d.amount.toString()}); setShowModal(true); }}
            onDelete={async (d) => { if (!window.confirm('Delete?')) return; await debtAPI.delete(d._id); fetchDebts(); }} />)}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editDebt ? 'Edit Record' : 'New Debt Record'} size="sm"
        footer={<div className="flex gap-3"><button onClick={() => setShowModal(false)} className="btn-ghost flex-1">Cancel</button><button onClick={handleSave} className="btn-primary flex-1 justify-center">Save</button></div>}>
        <div className="space-y-4">
          <div><label className="label">Name / Person</label><input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} className="input" placeholder="e.g. Ahmed Khan" /></div>
          <div><label className="label">Description</label><input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} className="input" placeholder="Optional..." /></div>
          <div><label className="label">Amount (৳)</label><input type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} className="input font-mono" /></div>
          <div><label className="label">Account</label><select value={form.account} onChange={e => setForm(f=>({...f,account:e.target.value}))} className="input"><option value="">Select account</option>{accounts.map(a=><option key={a._id} value={a._id}>{a.name}</option>)}</select></div>
          <div><label className="label">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm(f=>({...f,dueDate:e.target.value}))} className="input" /></div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPayModal} onClose={() => setShowPayModal(false)} title={`Payment — ${payingDebt?.name}`} size="sm"
        footer={<div className="flex gap-3"><button onClick={() => setShowPayModal(false)} className="btn-ghost flex-1">Cancel</button><button onClick={handlePayment} className="btn-primary flex-1 justify-center">Record Payment</button></div>}>
        <div className="space-y-4">
          {payingDebt && <div className="bg-surface-50 dark:bg-surface-900 rounded-xl p-3 text-sm"><p className="text-surface-500">Remaining: <span className="font-bold text-surface-800 dark:text-surface-200">{formatCurrency(payingDebt.amount - payingDebt.paidAmount)}</span></p></div>}
          <div><label className="label">Payment Amount (৳)</label><input type="number" value={payForm.amount} onChange={e => setPayForm(f=>({...f,amount:e.target.value}))} className="input font-mono" /></div>
          <div><label className="label">Note</label><input value={payForm.note} onChange={e => setPayForm(f=>({...f,note:e.target.value}))} className="input" placeholder="Optional" /></div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={payForm.createTransaction} onChange={e => setPayForm(f=>({...f,createTransaction:e.target.checked}))} className="w-4 h-4 rounded accent-primary-600" />
            <span className="text-sm text-surface-700 dark:text-surface-300">Create a transaction record</span>
          </label>
          {payForm.createTransaction && <div><label className="label">From Account</label><select value={payForm.accountId} onChange={e => setPayForm(f=>({...f,accountId:e.target.value}))} className="input"><option value="">Select account</option>{accounts.map(a=><option key={a._id} value={a._id}>{a.name}</option>)}</select></div>}
        </div>
      </Modal>
    </div>
  );
}