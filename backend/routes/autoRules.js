const router = require('express').Router();
const AutoRule = require('../models/AutoRule');
const { protect } = require('../middleware/auth');
router.use(protect);

router.get('/', async (req, res) => {
  const rules = await AutoRule.find({ user: req.user._id })
    .populate('actions.setCategory', 'name').populate('actions.addTags', 'name');
  res.json({ success: true, data: rules });
});
router.post('/', async (req, res) => {
  const rule = await AutoRule.create({ user: req.user._id, ...req.body });
  res.status(201).json({ success: true, data: rule });
});
router.put('/:id', async (req, res) => {
  const rule = await AutoRule.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true });
  res.json({ success: true, data: rule });
});
router.delete('/:id', async (req, res) => {
  await AutoRule.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true });
});
module.exports = router;
