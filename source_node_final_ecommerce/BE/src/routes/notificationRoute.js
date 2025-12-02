const express = require('express');
const router = express.Router();

// controller
const NotificationController = require('../app/controllers/NotificationController');
const { adminRequired, authRequired } = require('../app/middlewares/AuthMiddleware');

// Comment router
router.get('/user/:user_id', NotificationController.getNotificationsByUserId);
router.patch('/:notification_id/mark-read', NotificationController.markRead);

// admin
module.exports = router;