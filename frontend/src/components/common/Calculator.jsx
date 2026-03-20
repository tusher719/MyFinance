import React, { useState, useCallback } from 'react';
import { Delete } from 'lucide-react';

export default function Calculator({ value, onChange }) {
  const [expression, setExpression] = useState(value?.toString() || '');

  const handleKey = useCallback((key) => {
    if (key === 'C') { setExpression(''); onChange(0); return; }
    if (key === '⌫') { const n = expression.slice(0,-1); setExpression(n); onChange(parseFloat(n)||0); return; }
    if (key === '=') {
      try {
        const result = Function('"use strict"; return (' + expression.replace(/×/g,'*').replace(/÷/g,'/') + ')')();
        const rounded = Math.round(result * 100) / 100;
        setExpression(rounded.toString()); onChange(rounded);
      } catch { setExpression('Error'); }
      return;
    }
    const newExpr = expression + key;
    setExpression(newExpr);
    try {
      const result = Function('"use strict"; return (' + newExpr.replace(/×/g,'*').replace(/÷/g,'/') + ')')();
      if (!isNaN(result)) onChange(Math.round(result * 100) / 100);
    } catch {}
  }, [expression, onChange]);

  const keys = [['7','8','9','÷'],['4','5','6','×'],['1','2','3','-'],['C','0','.','+'],[null,null,'⌫','=']];

  return (
    <div className="space-y-3">
      <div className="bg-surface-900 dark:bg-surface-950 rounded-xl px-4 py-3 text-right">
        <div className="text-surface-400 text-xs min-h-4 font-mono">{expression}</div>
        <div className="text-white text-3xl font-bold font-mono">
          {value || 0}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {keys.flat().map((key, i) => {
          if (!key) return <div key={i} />;
          const isOp = ['÷','×','-','+'].includes(key);
          const isEq = key === '=';
          const isDel = key === '⌫';
          return (
            <button key={i} onClick={() => handleKey(key)}
              className={`h-12 rounded-xl font-semibold text-base transition-all active:scale-95 ${
                isEq ? 'bg-primary-600 hover:bg-primary-500 text-white' :
                isOp ? 'bg-surface-200 dark:bg-surface-700 text-primary-600 dark:text-primary-400' :
                isDel ? 'bg-red-100 dark:bg-red-900/30 text-red-500' :
                'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 hover:bg-surface-200 dark:hover:bg-surface-700'
              }`}>
              {isDel ? <Delete size={16} className="mx-auto" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
