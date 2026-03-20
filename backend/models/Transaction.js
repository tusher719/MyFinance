const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
  amount: { type: Number, required: true, min: 0 },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  note: { type: String, trim: true },
  date: { type: Date, required: true, default: Date.now },
  paymentType: {
    type: String,
    enum: ['Cash', 'Card', 'Bank Transfer', 'Mobile Banking', 'Cheque', 'Other'],
    default: 'Cash'
  },
  status: { type: String, enum: ['reconciled', 'cleared', 'uncleared'], default: 'cleared' },
  attachments: [{ fileId: String, filename: String, mimetype: String, size: Number, uploadedAt: Date }],
  isRecurring: { type: Boolean, default: false },
  recurringId: { type: mongoose.Schema.Types.ObjectId, ref: 'RecurringRule' },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  transferPairId: { type: mongoose.Schema.Types.ObjectId },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ user: 1, account: 1 });
transactionSchema.index({ user: 1, category: 1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
