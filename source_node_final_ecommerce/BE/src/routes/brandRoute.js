const express = require('express');
const router = express.Router();

// controller
const BrandController = require('../app/controllers/BrandController');
const { adminRequired } = require('../app/middlewares/AuthMiddleware');
const { uploadProduct } = require('../config/multer/multerConfig');

// Brand router
router.get('/:id/detail', BrandController.detail);
router.get('/:slug', BrandController.show);
// Protected routes - only for admin
router.post('/', adminRequired, uploadProduct.single('image'), BrandController.store);
router.put('/:id/edit', adminRequired, uploadProduct.single('image'), BrandController.update);
router.get('/', BrandController.index);

module.exports = router;