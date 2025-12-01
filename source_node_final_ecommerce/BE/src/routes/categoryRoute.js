const express = require('express');
const router = express.Router();

// controller
const CategoryController = require('../app/controllers/CategoryController');
const { adminRequired, authRequired } = require('../app/middlewares/AuthMiddleware');
const upload = require('../config/multer/multerConfig.js');

// Category router 
router.get('/tree', CategoryController.getCategoryTree);
router.get('/root', CategoryController.getAllCategoryRoots);
router.get('/:id/show', authRequired, adminRequired, CategoryController.getDetailById);
router.get('/:slug', CategoryController.detail);
router.get('/', CategoryController.index);

// Protected routes - only for admin
router.post('/', authRequired, adminRequired, upload.single('image'), CategoryController.store);

router.put('/edit/:id', authRequired, adminRequired, upload.single('image'), CategoryController.update);
router.patch('/:id/restore', authRequired, adminRequired, CategoryController.restore);

router.delete('/:id/force', authRequired, adminRequired, CategoryController.forceDestroy);
router.delete('/:id', authRequired, adminRequired, CategoryController.softDelete);

module.exports = router;