const express = require('express');
const router = express.Router();

// controller
const RatingController = require('../app/controllers/RatingController');
const { authRequired } = require('../app/middlewares/AuthMiddleware');

// Rating router
// router.post('/user/:user_id/rate/:product_id', RatingController.rateProduct);
router.get('/user/:user_id/rate/:product_id', authRequired, RatingController.getRatingByUserAndProduct);
router.put('/user/:user_id/rate/:product_id', authRequired, RatingController.rateProduct);


// chưa dùng đến
router.get('/:product_id/ratings-by-product', RatingController.ratingsByProductId); 
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Rating route is working' });
}) 

module.exports = router;