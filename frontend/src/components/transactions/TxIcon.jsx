import React from 'react';
import * as LucideIcons from 'lucide-react';

// emoji কিনা check করে
export const isEmoji = (str) => str && /\p{Emoji}/u.test(str);

// type-wise default config
export const TYPE_ICON_CONFIG = {
  income:   { bg: 'bg-emerald-50 dark:bg-emerald-900/20', color: 'text-emerald-500', hex: '#10b981' },
  expense:  { bg: 'bg-red-50 dark:bg-red-900/20',         color: 'text-red-500',     hex: '#ef4444' },
  transfer: { bg: 'bg-amber-50 dark:bg-amber-900/20',     color: 'text-amber-500',   hex: '#f59e0b' },
};

/**
 * Renders a transaction icon inside a rounded box.
 * Handles: emoji, lucide icon name string, or fallback to type icon.
 *
 * @param {string}  icon      - category icon (emoji or lucide name)
 * @param {string}  color     - category hex color
 * @param {string}  type      - transaction type (income/expense/transfer)
 * @param {string}  className - extra classes for the wrapper div
 */
export default function TxIcon({ icon, color, type = 'expense', className = '' }) {
  const typeCfg = TYPE_ICON_CONFIG[type] || TYPE_ICON_CONFIG.expense;

  // ── emoji ──────────────────────────────────────────────────────────────
  if (icon && isEmoji(icon)) {
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${className}`}
        style={{ backgroundColor: (color || typeCfg.hex) + '22' }}>
        {icon}
      </div>
    );
  }

  // ── lucide icon name ────────────────────────────────────────────────────
  if (icon && LucideIcons[icon]) {
    const Comp = LucideIcons[icon];
    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${className}`}
        style={{ backgroundColor: (color || typeCfg.hex) + '22' }}>
        <Comp size={18} style={{ color: color || typeCfg.hex }} />
      </div>
    );
  }

  // ── fallback: type-based arrow icon ─────────────────────────────────────
  const { ArrowDownLeft, ArrowUpRight, ArrowLeftRight } = LucideIcons;
  const FallbackIcons = { income: ArrowDownLeft, expense: ArrowUpRight, transfer: ArrowLeftRight };
  const Fallback = FallbackIcons[type] || ArrowLeftRight;

  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeCfg.bg} ${className}`}>
      <Fallback size={16} className={typeCfg.color} />
    </div>
  );
}