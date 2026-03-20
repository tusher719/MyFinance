const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');

exports.getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [accounts, monthStats, recentTx] = await Promise.all([
      Account.find({ user: req.user._id, isActive: true, excludeFromStats: false }),
      Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth }, isDeleted: false } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Transaction.find({ user: req.user._id, isDeleted: false })
        .populate('account', 'name color').populate('category', 'name color icon')
        .sort({ date: -1 }).limit(10)
    ]);

    const totalBalance = accounts.reduce((s, a) => s + a.currentBalance, 0);
    const income = monthStats.find(s => s._id === 'income')?.total || 0;
    const expense = monthStats.find(s => s._id === 'expense')?.total || 0;

    const spendingByCategory = await Transaction.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth }, isDeleted: false } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } }, { $limit: 6 },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } }
    ]);

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const s = new Date(d.getFullYear(), d.getMonth(), 1);
      const e = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const stats = await Transaction.aggregate([
        { $match: { user: req.user._id, date: { $gte: s, $lte: e }, isDeleted: false, type: { $in: ['income', 'expense'] } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } }
      ]);
      last6Months.push({
        month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(),
        income: stats.find(s => s._id === 'income')?.total || 0,
        expense: stats.find(s => s._id === 'expense')?.total || 0
      });
    }

    res.json({ success: true, data: { totalBalance, monthlyIncome: income, monthlyExpense: expense, netSavings: income - expense, recentTransactions: recentTx, spendingByCategory, cashFlowTrend: last6Months, accounts } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getSpendingStats = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'category' } = req.query;
    const filter = { user: req.user._id, type: 'expense', isDeleted: false };
    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate) filter.date = { ...(filter.date || {}), $lte: new Date(endDate) };

    const groupField = groupBy === 'tag' ? '$tags' : `$${groupBy}`;
    const stats = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: groupField, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $lookup: { from: groupBy === 'category' ? 'categories' : 'tags', localField: '_id', foreignField: '_id', as: 'details' } }
    ]);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
