const express = require('express');
const router = express.Router();

// controller
const CommentController = require('../app/controllers/CommentController');
const { adminRequired, authRequired } = require('../app/middlewares/AuthMiddleware');

// Comment router
router.get('/:product_id/comments-by-product', CommentController.getCommentsByProductId);
router.post('/:product_id/add-comment', CommentController.createComment);

// admin
router.delete('/:comment_id', authRequired, adminRequired, CommentController.deleteCommentById);
module.exports = router;