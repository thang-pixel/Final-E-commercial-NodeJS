const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');
const { authRequired, adminRequired } = require('../app/middlewares/AuthMiddleware');

// User profile routes
router.get('/me', authRequired, UserController.getMe);
router.put('/me', authRequired, UserController.updateMe);
router.patch('/me/change-password', authRequired, UserController.changePassword);

// Address routes
router.post('/me/address', authRequired, UserController.addAddress);
router.put('/me/address/:addressId', authRequired, UserController.updateAddress);
router.delete('/me/address/:addressId', authRequired, UserController.deleteAddress);

module.exports = router;