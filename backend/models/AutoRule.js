const mongoose = require('mongoose');

const autoRuleSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  conditions: [{
    field: { type: String, enum: ['note', 'amount', 'account'], required: true },
    operator: { type: String, enum: ['contains', 'equals', 'greater_than', 'less_than'], required: true },
    value: { type: String, required: true }
  }],
  conditionLogic: { type: String, enum: ['AND', 'OR'], default: 'AND' },
  actions: {
    setCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    addTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    setNote: { type: String }
  },
  appliedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('AutoRule', autoRuleSchema);
