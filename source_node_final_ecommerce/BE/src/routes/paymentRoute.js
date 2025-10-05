const express = require('express');
const router = express.Router();

// controller
// const PaymentController = require('../app/controllers/PaymentController');

// Payment router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Payment route is working' });
})
// router.get('/:slug', PaymentController.show);
// router.get('/', PaymentController.index);
// router.post('/', PaymentController.store);   

module.exports = router;