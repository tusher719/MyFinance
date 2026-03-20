import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, size = 'md', footer }) {
  useEffect(() => {
    if (isOpen) { document.body.style.overflow = 'hidden'; }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-screen-lg' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-surface-800 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-scale-in max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-700 shrink-0">
          <h2 className="font-display font-semibold text-lg text-surface-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-2 -mr-2 rounded-xl"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-surface-100 dark:border-surface-700 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
