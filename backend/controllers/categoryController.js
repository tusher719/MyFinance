const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const cats = await Category.find({ user: req.user._id, isVisible: true }).sort('order');
    const tree = cats.filter(c => !c.parent).map(parent => ({
      ...parent.toObject(),
      children: cats.filter(c => c.parent?.toString() === parent._id.toString()).map(child => ({
        ...child.toObject(),
        children: cats.filter(c => c.parent?.toString() === child._id.toString())
      }))
    }));
    res.json({ success: true, data: tree });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, color, icon, nature, type, parent } = req.body;
    let level = 0;
    if (parent) {
      const parentCat = await Category.findById(parent);
      if (!parentCat) return res.status(404).json({ success: false, message: 'Parent category not found' });
      level = parentCat.level + 1;
      if (level > 2) return res.status(400).json({ success: false, message: 'Max 3 levels allowed' });
    }
    const cat = await Category.create({ user: req.user._id, name, color, icon, nature, type, parent, level });
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body, { new: true }
    );
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isVisible: false });
    res.json({ success: true, message: 'Category hidden' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
