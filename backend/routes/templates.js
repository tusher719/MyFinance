const router = require('express').Router();
const Template = require('../models/Template');
const { protect } = require('../middleware/auth');
router.use(protect);

router.get('/', async (req, res) => {
  const templates = await Template.find({ user: req.user._id })
    .populate('account', 'name').populate('category', 'name icon color').populate('tags', 'name color');
  res.json({ success: true, data: templates });
});
router.post('/', async (req, res) => {
  const t = await Template.create({ user: req.user._id, ...req.body });
  res.status(201).json({ success: true, data: t });
});
router.delete('/:id', async (req, res) => {
  await Template.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});
module.exports = router;
