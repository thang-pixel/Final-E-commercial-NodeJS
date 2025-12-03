const express = require('express');
const router = express.Router();

// controller
const homeController = require('../app/controllers/HomeController');

// Home router
router.get('/new-products', homeController.newProducts);
router.get('/best-sellers', homeController.getBestSellerProducts);
router.get('/', homeController.index);

module.exports = router;