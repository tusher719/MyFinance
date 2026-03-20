const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['user', 'superadmin'], default: 'user' },
  avatar: { type: String },
  currency: { type: String, default: 'BDT' },
  timezone: { type: String, default: 'Asia/Dhaka' },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  notificationSettings: {
    budgetAlerts: { type: Boolean, default: true },
    debtReminders: { type: Boolean, default: true },
    lowBalanceAlerts: { type: Boolean, default: true },
    lowBalanceThreshold: { type: Number, default: 1000 }
  },
  sessions: [{
    token: String,
    device: String,
    ip: String,
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
