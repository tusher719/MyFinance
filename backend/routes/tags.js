const router = require('express').Router();
const Tag = require('../models/Tag');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/', async (req, res) => {
  const tags = await Tag.find({ user: req.user._id });
  res.json({ success: true, data: tags });
});
router.post('/', async (req, res) => {
  const tag = await Tag.create({ user: req.user._id, ...req.body });
  res.status(201).json({ success: true, data: tag });
});
router.put('/:id', async (req, res) => {
  const tag = await Tag.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  res.json({ success: true, data: tag });
});
router.delete('/:id', async (req, res) => {
  await Tag.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: 'Tag deleted' });
});
module.exports = router;
