const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#6366f1' },
  icon: { type: String, default: '📁' },
  nature: { type: String, enum: ['None', 'Must', 'Need', 'Want'], default: 'None' },
  type: { type: String, enum: ['income', 'expense', 'both'], default: 'expense' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  level: { type: Number, default: 0, max: 2 },
  isVisible: { type: Boolean, default: true },
  isSystem: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.index({ user: 1, parent: 1 });

module.exports = mongoose.model('Category', categorySchema);
