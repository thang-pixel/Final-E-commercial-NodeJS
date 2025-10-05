const express = require('express');
const router = express.Router();

// controller
const BrandController = require('../app/controllers/BrandController');
const { adminRequired } = require('../app/middlewares/AuthMiddleware');

// Brand router
router.get('/:slug', BrandController.detail);
// Protected routes - only for admin
router.post('/', adminRequired, BrandController.store);
router.put('/:slug/edit', adminRequired, BrandController.update);
router.get('/', BrandController.index);

module.exports = router;