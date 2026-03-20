const router = require('express').Router();
const { getDashboard, getSpendingStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/dashboard', getDashboard);
router.get('/spending', getSpendingStats);
module.exports = router;
