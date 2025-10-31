const express = require('express');
const router = express.Router();

// controller
const CategoryController = require('../app/controllers/CategoryController');
const { adminRequired } = require('../app/middlewares/AuthMiddleware');
const { uploadProduct } = require('../config/multer/multerConfig');

// Category router 
router.get('/:id/show', CategoryController.getDetailById);
router.get('/:slug', CategoryController.detail);
// Protected routes - only for admin
router.post('/', adminRequired, uploadProduct.single('image'), CategoryController.store);
router.put('/edit/:id', adminRequired, uploadProduct.single('image'), CategoryController.update);
router.patch('/:id/restore', adminRequired, CategoryController.restore);
router.delete('/:id/force', adminRequired, CategoryController.forceDestroy);
router.delete('/:id', adminRequired, CategoryController.softDelete);
router.get('/', CategoryController.index);

module.exports = router;