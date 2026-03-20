const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const AutoRule = require('../models/AutoRule');
const mongoose = require('mongoose');

// ─── helpers ──────────────────────────────────────────────────────────────────
const toObjId = (val) => (val && val !== '' ? val : undefined);

const applyAutoRules = async (userId, transactionData) => {
  const rules = await AutoRule.find({ user: userId, isActive: true });
  let updates = {};
  for (const rule of rules) {
    let match = rule.conditionLogic === 'AND';
    for (const cond of rule.conditions) {
      let condMet = false;
      const val = transactionData[cond.field]?.toString().toLowerCase() || '';
      const condVal = cond.value.toLowerCase();
      if (cond.operator === 'contains')     condMet = val.includes(condVal);
      else if (cond.operator === 'equals')       condMet = val === condVal;
      else if (cond.operator === 'greater_than') condMet = parseFloat(val) > parseFloat(condVal);
      else if (cond.operator === 'less_than')    condMet = parseFloat(val) < parseFloat(condVal);

      if (rule.conditionLogic === 'AND' && !condMet) { match = false; break; }
      if (rule.conditionLogic === 'OR'  &&  condMet) { match = true;  break; }
    }
    if (match) {
      if (rule.actions.setCategory)   updates.category = rule.actions.setCategory;
      if (rule.actions.addTags?.length) updates.tags = [...(updates.tags || []), ...rule.actions.addTags];
      if (rule.actions.setNote)        updates.note = rule.actions.setNote;
      rule.appliedCount += 1;
      await rule.save();
    }
  }
  return updates;
};

const updateAccountBalance = async (accountId, amount, type, reverse = false) => {
  const multiplier = reverse ? -1 : 1;
  let balanceChange = 0;
  if (type === 'income')   balanceChange =  amount * multiplier;
  else if (type === 'expense') balanceChange = -amount * multiplier;
  if (balanceChange !== 0) {
    await Account.findByIdAndUpdate(accountId, { $inc: { currentBalance: balanceChange } });
  }
};

// ─── GET /transactions ────────────────────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, account, category, startDate, endDate, status, search, tags } = req.query;
    const filter = { user: req.user._id, isDeleted: false };

    if (type)     filter.type    = type;
    if (account)  filter.account = account;
    if (category) filter.category = category;
    if (status)   filter.status  = status;
    if (tags)     filter.tags    = { $in: tags.split(',') };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }
    if (search) filter.note = { $regex: search, $options: 'i' };

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('account',   'name color type')
      .populate('toAccount', 'name color type')
      .populate('category',  'name color icon')
      .populate('tags',      'name color')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const summary = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    res.json({ success: true, data: { transactions, total, summary, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /transactions ───────────────────────────────────────────────────────
exports.createTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let { type, amount, account, toAccount, category, tags, note, date, paymentType, status } = req.body;

    // ⚠️ Convert empty strings → undefined so Mongoose doesn't try to cast "" as ObjectId
    toAccount = toObjId(toAccount);
    category  = toObjId(category);
    const cleanTags = Array.isArray(tags) ? tags.filter(t => t && t !== '') : [];

    const autoUpdates = await applyAutoRules(req.user._id, { note, amount });
    if (autoUpdates.category && !category) category = autoUpdates.category;
    if (autoUpdates.tags?.length) cleanTags.push(...autoUpdates.tags);

    const transaction = await Transaction.create([{
      user: req.user._id,
      type,
      amount,
      account,
      toAccount,
      category,
      tags: cleanTags,
      note,
      date: date || new Date(),
      paymentType,
      status: status || 'cleared',
    }], { session });

    await updateAccountBalance(account, amount, type);
    if (type === 'transfer' && toAccount) {
      await Account.findByIdAndUpdate(toAccount, { $inc: { currentBalance: amount } });
    }

    await session.commitTransaction();

    const populated = await Transaction.findById(transaction[0]._id)
      .populate('account',   'name color type')
      .populate('toAccount', 'name color type')
      .populate('category',  'name color icon')
      .populate('tags',      'name color');

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    session.endSession();
  }
};

// ─── PUT /transactions/:id ────────────────────────────────────────────────────
exports.updateTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

    // Reverse old balance
    await updateAccountBalance(tx.account, tx.amount, tx.type, true);
    if (tx.type === 'transfer' && tx.toAccount) {
      await Account.findByIdAndUpdate(tx.toAccount, { $inc: { currentBalance: -tx.amount } });
    }

    // Clean incoming data
    const body = { ...req.body };
    body.toAccount = toObjId(body.toAccount);
    body.category  = toObjId(body.category);
    if (Array.isArray(body.tags)) body.tags = body.tags.filter(t => t && t !== '');

    const updated = await Transaction.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true })
      .populate('account',   'name color type')
      .populate('toAccount', 'name color type')
      .populate('category',  'name color icon')
      .populate('tags',      'name color');

    // Apply new balance
    await updateAccountBalance(updated.account, updated.amount, updated.type);
    if (updated.type === 'transfer' && updated.toAccount) {
      await Account.findByIdAndUpdate(updated.toAccount, { $inc: { currentBalance: updated.amount } });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /transactions/:id ─────────────────────────────────────────────────
exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ success: false, message: 'Transaction not found' });

    await updateAccountBalance(tx.account, tx.amount, tx.type, true);
    if (tx.type === 'transfer' && tx.toAccount) {
      await Account.findByIdAndUpdate(tx.toAccount, { $inc: { currentBalance: -tx.amount } });
    }

    tx.isDeleted = true;
    tx.deletedAt = new Date();
    await tx.save();

    res.json({ success: true, message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};