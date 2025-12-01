const express = require('express');
const router = express.Router();
const PaymentController = require('../app/controllers/PaymentController');
const { authRequired } = require('../app/middlewares/AuthMiddleware');

// VNPay routes - Fixed path
router.post('/vnpay/create', authRequired, PaymentController.createVNPayPayment);
router.get('/vnpay/return', PaymentController.handleVNPayReturn);
router.post('/vnpay/ipn', PaymentController.handleVNPayIPN);

// Payment status routes
router.get('/:payment_id/status', authRequired, PaymentController.getPaymentStatus);
router.post('/query/:order_id', authRequired, PaymentController.queryPaymentStatus);

module.exports = router;