import React from 'react';

const AmountDisplay = ({ amount, type, currency = '৳', size = 'base', showSign = true }) => {
  const isIncome = type === 'income';
  const isExpense = type === 'expense';
  const sizeClasses = { sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl' };
  const colorClass = isIncome ? 'income-text' : isExpense ? 'expense-text' : 'transfer-text';
  const sign = showSign ? (isIncome ? '+' : isExpense ? '-' : '') : '';

  return (
    <span className={`font-mono font-semibold ${sizeClasses[size]} ${colorClass}`}>
      {sign}{currency}{Math.abs(amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
    </span>
  );
};

export default AmountDisplay;
