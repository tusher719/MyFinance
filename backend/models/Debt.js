const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['lent', 'borrowed'], required: true },
  status: { type: String, enum: ['active', 'closed', 'overdue'], default: 'active' },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  amount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0 },
  date: { type: Date, required: true, default: Date.now },
  dueDate: { type: Date },
  linkedTransaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  payments: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
  }],
  reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Debt', debtSchema);
