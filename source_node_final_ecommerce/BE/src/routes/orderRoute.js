const express = require('express');
const router = express.Router();
const OrderController = require('../app/controllers/OrderController');
const { authRequired, adminRequired } = require('../app/middlewares/AuthMiddleware');

// Routes cho khách hàng
router.post('/', authRequired, OrderController.createOrder);
router.get('/', authRequired, OrderController.getMyOrders);
router.get('/:id', authRequired, OrderController.getOrderDetail);
router.patch('/:id/cancel', authRequired, OrderController.cancelOrder);

// Routes cho admin
router.get('/admin/all', adminRequired, OrderController.getAllOrdersForAdmin);
router.get('/admin/:id', adminRequired, OrderController.getOrderDetailForAdmin);
router.patch('/:id/status', adminRequired, OrderController.updateOrderStatus);

module.exports = router;