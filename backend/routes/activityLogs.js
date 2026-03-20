const router = require('express').Router();
const ActivityLog = require('../models/ActivityLog');
const { protect, authorize } = require('../middleware/auth');
router.use(protect);

router.get('/', async (req, res) => {
  const query = req.user.role === 'superadmin' ? {} : { user: req.user._id };
  const logs = await ActivityLog.find(query).populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: logs });
});
module.exports = router;
