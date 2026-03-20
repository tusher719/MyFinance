const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const m = parseInt(month) || now.getMonth() + 1;
    const y = parseInt(year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user._id, month: m, year: y, isActive: true })
      .populate('category', 'name color icon');

    const budgetsWithSpent = await Promise.all(budgets.map(async (b) => {
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59);
      const spent = await Transaction.aggregate([
        { $match: { user: req.user._id, category: b.category._id, type: 'expense', date: { $gte: start, $lte: end }, isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const spentAmount = spent[0]?.total || 0;
      return { ...b.toObject(), spent: spentAmount, remaining: b.amount - spentAmount, percentage: Math.round((spentAmount / b.amount) * 100) };
    }));

    res.json({ success: true, data: budgetsWithSpent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { name, category, amount, period, month, year, alertThreshold, rollover } = req.body;
    const budget = await Budget.create({ user: req.user._id, name, category, amount, period, month, year, alertThreshold, rollover });
    res.status(201).json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, data: budget });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    await Budget.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isActive: false });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
