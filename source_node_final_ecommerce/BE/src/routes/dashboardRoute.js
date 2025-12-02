const express = require('express');
const router = express.Router();
const DashboardController = require('../app/controllers/DashboardController');
const { adminRequired } = require('../app/middlewares/AuthMiddleware');

// Dashboard routes (Admin only)
router.get('/simple', adminRequired, DashboardController.getSimpleDashboard);
router.get('/advanced', adminRequired, DashboardController.getAdvancedDashboard);
router.get('/stats', adminRequired, DashboardController.getQuickStats);

module.exports = router;