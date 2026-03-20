const cron = require('node-cron');
const Budget = require('../models/Budget');
const Debt = require('../models/Debt');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const User = require('../models/User');

const createNotification = async (userId, type, title, message, data = {}) => {
  return await Notification.create({ user: userId, type, title, message, data });
};

// Check budgets every hour
const checkBudgets = async () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const budgets = await Budget.find({ month, year, isActive: true, alertSent: false }).populate('category');

  for (const budget of budgets) {
    const agg = await Transaction.aggregate([
      { $match: { user: budget.user, category: budget.category._id, type: 'expense', date: { $gte: start, $lte: end }, isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const spent = agg[0]?.total || 0;
    const pct = (spent / budget.amount) * 100;

    if (pct >= budget.alertThreshold && !budget.alertSent) {
      await createNotification(budget.user, 'budget_alert',
        `Budget Alert: ${budget.category.name}`,
        `You've used ${Math.round(pct)}% of your ৳${budget.amount.toLocaleString()} budget for ${budget.category.name}.`,
        { budgetId: budget._id, spent, amount: budget.amount, percentage: Math.round(pct) }
      );
      budget.alertSent = true;
      await budget.save();
    }
    if (spent > budget.amount) {
      await createNotification(budget.user, 'budget_alert',
        `Over Budget: ${budget.category.name}`,
        `You've exceeded your ৳${budget.amount.toLocaleString()} budget for ${budget.category.name} by ৳${(spent - budget.amount).toLocaleString()}.`,
        { budgetId: budget._id, spent, amount: budget.amount, overBy: spent - budget.amount }
      );
    }
  }
};

// Check debt due dates daily
const checkDebtReminders = async () => {
  const now = new Date();
  const in3days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const debts = await Debt.find({
    status: 'active',
    dueDate: { $lte: in3days, $gte: now },
    reminderSent: false
  });

  for (const debt of debts) {
    const daysLeft = Math.ceil((new Date(debt.dueDate) - now) / (1000 * 60 * 60 * 24));
    await createNotification(debt.user, 'debt_reminder',
      `Debt Due ${daysLeft <= 1 ? 'Tomorrow' : `in ${daysLeft} Days`}`,
      `Your ${debt.type === 'borrowed' ? 'debt to' : 'loan from'} ${debt.name} of ৳${(debt.amount - debt.paidAmount).toLocaleString()} is due on ${new Date(debt.dueDate).toLocaleDateString()}.`,
      { debtId: debt._id, daysLeft, amount: debt.amount - debt.paidAmount }
    );
    debt.reminderSent = true;
    await debt.save();
  }
};

// Check low balances daily
const checkLowBalances = async () => {
  const users = await User.find({ isActive: true });
  const Account = require('../models/Account');
  for (const user of users) {
    const threshold = user.notificationSettings?.lowBalanceThreshold || 1000;
    if (!user.notificationSettings?.lowBalanceAlerts) continue;
    const accounts = await Account.find({ user: user._id, isActive: true });
    for (const account of accounts) {
      if (account.currentBalance < threshold && account.currentBalance >= 0) {
        await createNotification(user._id, 'low_balance',
          `Low Balance: ${account.name}`,
          `Your ${account.name} balance is ৳${account.currentBalance.toLocaleString()}, below your alert threshold of ৳${threshold.toLocaleString()}.`,
          { accountId: account._id, balance: account.currentBalance }
        );
      }
    }
  }
};

const startCronJobs = () => {
  cron.schedule('0 * * * *', checkBudgets);      // hourly
  cron.schedule('0 9 * * *', checkDebtReminders); // daily 9am
  cron.schedule('0 8 * * *', checkLowBalances);   // daily 8am
  console.log('✅ Notification cron jobs started');
};

module.exports = { startCronJobs, createNotification };
