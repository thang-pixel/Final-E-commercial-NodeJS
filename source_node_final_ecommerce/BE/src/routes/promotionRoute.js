const express = require('express');
const router = express.Router();
const PromotionController = require('../app/controllers/PromotionController');
const { authRequired, adminRequired } = require('../app/middlewares/AuthMiddleware');

// Public routes
router.post('/validate', authRequired, PromotionController.validatePromotion);

// Admin routes
router.get('/', adminRequired, PromotionController.index);
router.get('/:id', adminRequired, PromotionController.detail);
router.post('/', adminRequired, PromotionController.store);
router.put('/:id', adminRequired, PromotionController.update);
router.delete('/:id', adminRequired, PromotionController.destroy);

module.exports = router;