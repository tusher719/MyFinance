const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  color: { type: String, default: '#10b981' },
  autoAssign: { type: Boolean, default: false },
  autoAssignKeywords: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Tag', tagSchema);
