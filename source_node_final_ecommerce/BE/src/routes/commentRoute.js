const express = require('express');
const router = express.Router();

// controller
const CommentController = require('../app/controllers/CommentController');

// Comment router

router.get('/:product_id/comments-by-product', CommentController.getCommentsByProductId);
router.get('/:user_id/comments-by-user', CommentController.getCommentsByUserId);

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Comment route is working' });
});

module.exports = router;