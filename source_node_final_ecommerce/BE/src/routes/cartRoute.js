const express = require('express');
const router = express.Router();

// controller
// const CartController = require('../app/controllers/CartController');

// Cart router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Cart route is working' });
})
// router.get('/:slug', CartController.show);
// router.get('/', CartController.index);
// router.post('/', CartController.store);   

module.exports = router;