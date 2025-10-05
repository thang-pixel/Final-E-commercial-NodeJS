const express = require('express');
const router = express.Router();

// controller
// const ProductController = require('../app/controllers/ProductController');

// Product router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Product route is working' });
})
// router.get('/:slug', ProductController.show);
// router.get('/', ProductController.index);
// router.post('/', ProductController.store);   

module.exports = router;