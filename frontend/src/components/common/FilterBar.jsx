import React, { useState } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { DATE_PRESETS } from '../../utils/helpers';
import { format } from 'date-fns';

export default function FilterBar({ filters, onChange, accounts = [], showAccountFilter = true }) {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const setPreset = (preset) => {
    onChange({ ...filters, datePreset: preset, startDate: null, endDate: null });
    setShowDatePicker(false);
  };

  const activePreset = DATE_PRESETS.find(p => p.value === filters.datePreset);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <button onClick={() => setShowDatePicker(!showDatePicker)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm font-medium hover:border-primary-500 transition-colors">
          <Calendar size={14} className="text-primary-500" />
          <span className="text-surface-700 dark:text-surface-300">
            {filters.startDate && filters.endDate
              ? `${format(new Date(filters.startDate),'dd MMM')} – ${format(new Date(filters.endDate),'dd MMM')}`
              : activePreset?.label || 'This Month'}
          </span>
          <ChevronDown size={14} className="text-surface-400" />
        </button>
        {showDatePicker && (
          <div className="absolute top-full left-0 mt-2 z-30 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-100 dark:border-surface-700 p-3 w-64">
            <div className="grid grid-cols-2 gap-1 mb-3">
              {DATE_PRESETS.map(p => (
                <button key={p.value} onClick={() => setPreset(p.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    filters.datePreset === p.value ? 'bg-primary-600 text-white' : 'hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-400'
                  }`}>{p.label}</button>
              ))}
            </div>
            <div className="border-t border-surface-100 dark:border-surface-700 pt-3 space-y-2">
              <p className="text-xs font-semibold text-surface-400 uppercase tracking-wide">Custom Range</p>
              <input type="date" value={filters.startDate || ''} onChange={e => onChange({...filters, startDate: e.target.value, datePreset: null})} className="input text-xs py-2" />
              <input type="date" value={filters.endDate || ''} onChange={e => { onChange({...filters, endDate: e.target.value, datePreset: null}); setShowDatePicker(false); }} className="input text-xs py-2" />
            </div>
          </div>
        )}
      </div>

      {showAccountFilter && accounts.length > 0 && (
        <select value={filters.account || ''} onChange={e => onChange({...filters, account: e.target.value})}
          className="px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:border-primary-500">
          <option value="">All Accounts</option>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
        </select>
      )}

      <select value={filters.type || ''} onChange={e => onChange({...filters, type: e.target.value})}
        className="px-3 py-2 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-700 dark:text-surface-300 focus:outline-none focus:border-primary-500">
        <option value="">All Types</option>
        <option value="income">Income</option>
        <option value="expense">Expense</option>
        <option value="transfer">Transfer</option>
      </select>

      {(filters.type || filters.account || (filters.startDate && filters.endDate)) && (
        <button onClick={() => onChange({ datePreset: 'this_month', type: '', account: '', startDate: null, endDate: null })}
          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
}
