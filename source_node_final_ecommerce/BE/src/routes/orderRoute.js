const express = require('express');
const router = express.Router();

// controller
// const OrderController = require('../app/controllers/OrderController');

// Order router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Order route is working' });
})
// router.get('/:slug', OrderController.show);
// router.get('/', OrderController.index);
// router.post('/', OrderController.store);   

module.exports = router;