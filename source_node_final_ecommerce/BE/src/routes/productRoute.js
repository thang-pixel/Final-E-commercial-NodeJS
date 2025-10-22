const express = require('express');
const ProductController = require('../app/controllers/ProductController.js');
const router = express.Router();

// controller
// const ProductController = require('../app/controllers/ProductController');

// Product router


router.get('/search', ProductController.search);
// router.get('/:slug', ProductController.show);
// router.get('/', ProductController.index);
// router.post('/', ProductController.store);   
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Product route is working' });
})
module.exports = router;