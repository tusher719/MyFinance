import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6175f4','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

const SpendingChart = ({ data = [], loading }) => {
  if (loading) return <div className="skeleton h-56 w-full rounded-xl" />;
  const chartData = data.map((d, i) => ({
    name: d.category?.[0]?.name || 'Uncategorized',
    value: d.total,
    color: d.category?.[0]?.color || COLORS[i % COLORS.length]
  }));

  if (!chartData.length) return (
    <div className="flex items-center justify-center h-48 text-[var(--text3)] text-sm">No data</div>
  );

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="45%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {chartData.map((d, i) => <Cell key={i} fill={d.color} stroke="none" />)}
        </Pie>
        <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: 12 }} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} formatter={(v) => <span style={{ color: 'var(--text2)' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SpendingChart;
