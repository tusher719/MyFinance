const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true, min: 0 },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
  month: { type: Number, min: 1, max: 12 },
  year: { type: Number },
  spent: { type: Number, default: 0 },
  alertThreshold: { type: Number, default: 80 },
  alertSent: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rollover: { type: Boolean, default: false }
}, { timestamps: true });

budgetSchema.index({ user: 1, month: 1, year: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
