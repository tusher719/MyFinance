const Debt = require('../models/Debt');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

exports.getDebts = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    const debts = await Debt.find(filter).populate('account', 'name color').sort({ date: -1 });
    res.json({ success: true, data: debts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createDebt = async (req, res) => {
  try {
    const debt = await Debt.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: debt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const { amount, date, note, createTransaction, accountId } = req.body;
    const debt = await Debt.findOne({ _id: req.params.id, user: req.user._id });
    if (!debt) return res.status(404).json({ success: false, message: 'Debt not found' });

    debt.payments.push({ amount, date: date || new Date(), note });
    debt.paidAmount += amount;
    if (debt.paidAmount >= debt.amount) debt.status = 'closed';
    await debt.save();

    if (createTransaction && accountId) {
      await Transaction.create({
        user: req.user._id, type: debt.type === 'lent' ? 'income' : 'expense',
        amount, account: accountId, note: `Payment for debt: ${debt.name}`, date: date || new Date(), status: 'cleared'
      });
    }
    res.json({ success: true, data: debt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateDebt = async (req, res) => {
  try {
    const debt = await Debt.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
    if (!debt) return res.status(404).json({ success: false, message: 'Debt not found' });
    res.json({ success: true, data: debt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteDebt = async (req, res) => {
  try {
    await Debt.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Debt deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
