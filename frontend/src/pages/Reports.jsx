import React, { useState, useEffect } from 'react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { statsAPI } from '../services/api';
import { formatCurrency, getDateRange } from '../utils/helpers';
import FilterBar from '../components/common/FilterBar';
import { useApp } from '../contexts/AppContext';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-100 dark:border-surface-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold mb-2">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>)}
    </div>
  );
};

export default function Reports() {
  const { accounts } = useApp();
  const [activeTab, setActiveTab] = useState('cashflow');
  const [filters, setFilters] = useState({ datePreset: '6m' });
  const [dashData, setDashData] = useState(null);
  const [spendData, setSpendData] = useState([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { start, end } = getDateRange(filters.datePreset || '6m');
        const [dash, spend] = await Promise.all([
          statsAPI.getDashboard(),
          statsAPI.getSpending({ startDate: start.toISOString(), endDate: end.toISOString(), groupBy: 'category' })
        ]);
        setDashData(dash.data.data);
        setSpendData(spend.data.data);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [filters]);

  const TABS = [
    { id: 'cashflow', label: 'Cash Flow' },
    { id: 'spending', label: 'Spending' },
    { id: 'balance', label: 'Balance' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Reports</h1>
        <p className="text-sm text-surface-400 mt-1">Analyze your financial patterns</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === t.id ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm' : 'text-surface-500 dark:text-surface-400'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <FilterBar filters={filters} onChange={setFilters} accounts={accounts} showAccountFilter={false} />
      </div>

      {/* Cash Flow Tab */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-4 text-surface-800 dark:text-surface-200">Monthly Income vs Expense</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashData?.cashFlowTrend || []} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-surface-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `৳${v >= 1000 ? (v/1000).toFixed(0)+'K' : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-4 text-surface-800 dark:text-surface-200">Net Savings Trend</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={(dashData?.cashFlowTrend||[]).map(m => ({...m, net: m.income - m.expense}))} margin={{ left: -20 }}>
                <defs><linearGradient id="net" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-surface-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="net" name="Net Savings" stroke="#6366f1" strokeWidth={2} fill="url(#net)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Spending Tab */}
      {activeTab === 'spending' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-5">
              <h3 className="font-semibold mb-4 text-surface-800 dark:text-surface-200">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={spendData.map(s => ({ name: s.details?.[0]?.name || 'Other', value: s.total }))} cx="50%" cy="50%" outerRadius={100} innerRadius={60} dataKey="value" paddingAngle={2}>
                    {spendData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span className="text-xs">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card p-5">
              <h3 className="font-semibold mb-4 text-surface-800 dark:text-surface-200">Top Categories</h3>
              <div className="space-y-3">
                {spendData.slice(0,8).map((s, i) => {
                  const maxVal = spendData[0]?.total || 1;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-surface-700 dark:text-surface-300 font-medium">{s.details?.[0]?.icon || '📁'} {s.details?.[0]?.name || 'Unknown'}</span>
                        <span className="font-mono font-semibold">{formatCurrency(s.total)}</span>
                      </div>
                      <div className="w-full h-2 bg-surface-100 dark:bg-surface-700 rounded-full">
                        <div className="h-full rounded-full transition-all" style={{ width: `${(s.total/maxVal)*100}%`, backgroundColor: COLORS[i%COLORS.length] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Balance Tab */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(dashData?.accounts || []).map(acc => (
              <div key={acc._id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: acc.color || '#6366f1' }}>{acc.name.charAt(0)}</div>
                  <div><p className="font-semibold text-sm">{acc.name}</p><p className="text-xs text-surface-400">{acc.type}</p></div>
                </div>
                <p className={`text-xl font-bold font-mono ${acc.currentBalance < 0 ? 'text-red-600' : 'text-surface-900 dark:text-white'}`}>{formatCurrency(acc.currentBalance)}</p>
                <p className="text-xs text-surface-400 mt-1">Change: {formatCurrency(acc.currentBalance - acc.initialBalance)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}