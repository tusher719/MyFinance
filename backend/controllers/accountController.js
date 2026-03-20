const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user._id, isActive: true }).sort('order');
    const totals = accounts.reduce((acc, a) => {
      if (!a.excludeFromStats) {
        acc.totalBalance += a.currentBalance;
        if (['Savings', 'Checking', 'Cash', 'General'].includes(a.type)) acc.totalAssets += a.currentBalance;
        if (['Credit', 'Loan', 'Mortgage'].includes(a.type)) acc.totalLiabilities += Math.abs(a.currentBalance);
      }
      return acc;
    }, { totalBalance: 0, totalAssets: 0, totalLiabilities: 0 });
    res.json({ success: true, data: { accounts, totals } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, color, icon, type, customType, initialBalance, currency, excludeFromStats, creditLimit } = req.body;
    const account = await Account.create({
      user: req.user._id, name, color, icon, type, customType,
      initialBalance: initialBalance || 0,
      currentBalance: initialBalance || 0,
      currency, excludeFromStats, creditLimit
    });
    res.status(201).json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAccount = async (req, res) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const txCount = await Transaction.countDocuments({ user: req.user._id, account: req.params.id, isDeleted: false });
    if (txCount > 0) return res.status(400).json({ success: false, message: `Cannot delete account with ${txCount} transactions` });
    await Account.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
