const express = require('express');
const router = express.Router();

// controller
// const PromotionController = require('../app/controllers/PromotionController');

// Promotion router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Promotion route is working' });
})
// router.get('/:slug', PromotionController.show);
// router.get('/', PromotionController.index);
// router.post('/', PromotionController.store);   

module.exports = router;