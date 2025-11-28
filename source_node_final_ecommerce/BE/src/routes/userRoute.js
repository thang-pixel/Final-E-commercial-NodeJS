const express = require('express');
const router = express.Router();
const UserController = require('../app/controllers/UserController');
const { authRequired,adminRequired } = require('../app/middlewares/AuthMiddleware');


// // User router
// router.get('/:username/edit', UserController.updateMe);
// router.put('/:username', UserController.update);
// router.patch('/:username/change-password', UserController.changePassword);
// router.get('/', UserController.index);
// router.post('/', UserController.store);



// Profile của chính mình
router.get('/me', authRequired, UserController.getMe);
router.put('/me', authRequired, UserController.updateMe);
router.patch('/me/change-password', authRequired, UserController.changePassword);

// Địa chỉ giao hàng
router.post('/me/address', authRequired, UserController.addAddress);
router.put('/me/address/:id', authRequired, UserController.updateAddress);
router.delete('/me/address/:id', authRequired, UserController.deleteAddress);


// Admin quản lý user
router.get('/', authRequired, adminRequired, UserController.getAll);
router.put('/:id', authRequired, adminRequired, UserController.updateUser);
router.patch('/:id/ban', authRequired, adminRequired, UserController.banUser);
router.patch('/:id/unban', authRequired, adminRequired, UserController.unbanUser);

module.exports = router;