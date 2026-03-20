import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 bg-[var(--bg3)] rounded-2xl flex items-center justify-center mb-4">
      {Icon && typeof Icon === 'function'
        ? <Icon size={28} className="text-[var(--text3)]" />
        : typeof Icon === 'string'
          ? <span className="text-3xl">{Icon}</span>
          : <span className="text-3xl">📭</span>
      }
    </div>
    <h3 className="font-semibold text-[var(--text)] mb-1">{title}</h3>
    <p className="text-sm text-[var(--text2)] mb-5 max-w-sm">{description}</p>
    {action}
  </div>
);

export default EmptyState;