const express = require('express');
const router = express.Router();

// controller
const CategoryController = require('../app/controllers/CategoryController');
const { adminRequired } = require('../app/middlewares/AuthMiddleware');

// Category router 
router.get('/:slug', CategoryController.detail);
// Protected routes - only for admin
router.post('/', adminRequired, CategoryController.store);
router.put('/edit/:id', adminRequired, CategoryController.update);
router.patch('/categories/:id/restore', adminRequired, CategoryController.restore);
router.delete('/categories/:id/force', adminRequired, CategoryController.forceDestroy);
router.delete('/categories/:id', adminRequired, CategoryController.softDelete);
router.get('/', CategoryController.index);

module.exports = router;