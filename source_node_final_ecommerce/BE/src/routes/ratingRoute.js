const express = require('express');
const router = express.Router();

// controller
const RatingController = require('../app/controllers/RatingController');

// Rating router
router.get('/:product_id/ratings-by-product', RatingController.ratingsByProductId);
router.get('/:user_id/ratings-by-user', RatingController.ratingsByUserId);
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Rating route is working' });
}) 

module.exports = router;