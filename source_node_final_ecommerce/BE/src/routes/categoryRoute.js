const express = require('express');
const router = express.Router();

// controller
// const CategoryController = require('../app/controllers/CategoryController');

// Category router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Category route is working' });
})
// router.get('/:slug', CategoryController.show);
// router.get('/', CategoryController.index);
// router.post('/', CategoryController.store);   

module.exports = router;