import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

// onConfirm handles closing itself (async support)
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete', danger = true }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <div className="flex gap-3 mb-5">
      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center shrink-0">
        <AlertTriangle size={20} className="text-red-500" />
      </div>
      <p className="text-sm text-[var(--text2)] leading-relaxed">{message}</p>
    </div>
    <div className="flex gap-2 justify-end">
      <button onClick={onClose} className="btn-secondary text-sm">Cancel</button>
      <button
        onClick={onConfirm}
        className={`text-sm ${danger ? 'btn-danger' : 'btn-primary'}`}>
        {confirmLabel}
      </button>
    </div>
  </Modal>
);

export default ConfirmDialog;