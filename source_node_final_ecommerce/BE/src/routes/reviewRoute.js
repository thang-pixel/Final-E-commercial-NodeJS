const express = require('express');
const router = express.Router();

// controller
// const ReviewController = require('../app/controllers/ReviewController');

// Review router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Review route is working' });
})
// router.get('/:slug', ReviewController.show);
// router.get('/', ReviewController.index);
// router.post('/', ReviewController.store);   

module.exports = router;