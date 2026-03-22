import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, Target, Plus, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { statsAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { SkeletonCard } from '../components/common/Skeleton';
import TransactionModal from '../components/transactions/TransactionModal';
import TransactionRow from '../components/transactions/TransactionRow';

const StatCard = ({ icon: Icon, label, value, sub, color, trend }) => (
  <div className="stat-card card-hover">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold font-mono text-surface-900 dark:text-white mt-0.5">{value}</p>
    {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-xl p-3 shadow-xl text-sm">
      <p className="font-semibold mb-2 text-surface-700 dark:text-surface-300">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {formatCurrency(p.value)}</p>)}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { accounts } = useApp();
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try { const res = await statsAPI.getDashboard(); setData(res.data.data); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[0,1,2,3].map(i => <SkeletonCard key={i} />)}</div>
      <div className="grid lg:grid-cols-3 gap-6"><div className="lg:col-span-2"><SkeletonCard /></div><SkeletonCard /></div>
    </div>
  );

  const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-surface-400">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'} 👋</p>
          <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">{user?.name?.split(' ')[0]}</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} /> New Transaction
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Total Balance" value={formatCurrency(data?.totalBalance)} sub={`${accounts.length} accounts`} color="bg-primary-600" />
        <StatCard icon={TrendingDown} label="Monthly Income" value={formatCurrency(data?.monthlyIncome)} sub="This month" color="bg-emerald-500" />
        <StatCard icon={TrendingUp} label="Monthly Expense" value={formatCurrency(data?.monthlyExpense)} sub="This month" color="bg-red-500" />
        <StatCard icon={Target} label="Net Savings" value={formatCurrency(data?.netSavings)} sub={data?.netSavings >= 0 ? 'On track 🎯' : 'Over budget ⚠️'} color={data?.netSavings >= 0 ? 'bg-blue-500' : 'bg-amber-500'} />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-surface-800 dark:text-surface-200">Cash Flow (6 Months)</h2>
            <Link to="/reports" className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">View report <ArrowRight size={12} /></Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data?.cashFlowTrend || []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="income" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-surface-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fill="url(#income)" />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category */}
        <div className="card p-5">
          <h2 className="font-display font-semibold text-surface-800 dark:text-surface-200 mb-5">Top Spending</h2>
          {data?.spendingByCategory?.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.spendingByCategory.map(s => ({ name: s.category?.[0]?.name || 'Unknown', value: s.total }))}
                  cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={2} dataKey="value">
                  {data.spendingByCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="flex items-center justify-center h-48 text-surface-400 text-sm">No data yet</div>}
        </div>
      </div>

      {/* Accounts Summary */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data?.accounts || []).slice(0,4).map(acc => (
          <div key={acc._id} className="card p-4 card-hover cursor-pointer" onClick={() => navigate('/accounts')}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                style={{ backgroundColor: acc.color || '#6366f1' }}>{acc.name.charAt(0)}</div>
              <div className="min-w-0"><p className="text-sm font-semibold truncate text-surface-700 dark:text-surface-300">{acc.name}</p><p className="text-xs text-surface-400">{acc.type}</p></div>
            </div>
            <p className={`text-lg font-bold font-mono ${acc.currentBalance < 0 ? 'text-red-600 dark:text-red-400' : 'text-surface-900 dark:text-white'}`}>
              {formatCurrency(acc.currentBalance)}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 dark:border-surface-700">
          <h2 className="font-display font-semibold text-surface-800 dark:text-surface-200">Recent Transactions</h2>
          <Link to="/transactions" className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1">View all <ArrowRight size={12} /></Link>
        </div>
        <div className="divide-y divide-surface-50 dark:divide-surface-800">
          {(data?.recentTransactions || []).slice(0,8).map(tx => (
            <TransactionRow key={tx._id} transaction={tx} onEdit={() => {}} onDelete={() => {}} />
          ))}
          {!data?.recentTransactions?.length && (
            <div className="text-center py-12 text-surface-400 text-sm">No transactions yet. <button onClick={() => setShowModal(true)} className="text-primary-500 hover:underline">Add one!</button></div>
          )}
        </div>
      </div>

      <TransactionModal isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={() => { fetchData(); }} />
    </div>
  );
}