const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ success: true, data: { notifications, unread } });
});
router.put('/:id/read', async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true, readAt: new Date() });
  res.json({ success: true });
});
router.put('/mark-all-read', async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
  res.json({ success: true });
});
module.exports = router;
