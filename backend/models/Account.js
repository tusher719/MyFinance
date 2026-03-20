const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '💳' },
  type: {
    type: String,
    enum: ['General', 'Cash', 'Checking', 'Credit', 'Savings', 'Bonus', 'Insurance', 'Investment', 'Loan', 'Mortgage', 'Overdraft', 'Custom'],
    default: 'General'
  },
  customType: { type: String },
  initialBalance: { type: Number, default: 0 },
  currentBalance: { type: Number, default: 0 },
  currency: { type: String, default: 'BDT' },
  excludeFromStats: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  creditLimit: { type: Number },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
