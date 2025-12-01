const CommentModel = require('../models/CommentModel');

class CommentController {
  index(req, res) {}

  // [GET] /api/comments/:product_id/comments-by-product
  async getCommentsByProductId(req, res) {
    const { product_id } = req.params;
    const prodIdParsed = parseInt(product_id, 10);

    if (!prodIdParsed) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
        data: null,
      });
    }

    try {
      // Logic to fetch comments by prodIdParsed goes here
      const comments = await CommentModel.find({ product_id: prodIdParsed });

      // lấy comment theo cấp: level 1, level 2, ... về sau nha

      return res.status(200).json({
        success: true,
        message: 'Danh sách bình luận theo product ID',
        data: comments,
      });
    } catch (error) {
      console.error('Lỗi khi lấy bình luận:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
        data: null,
        error,
      });
    }
  }

  // [GET] /api/comments/:user_id/comments-by-user
  async getCommentsByUserId(req, res) {
    const { user_id } = req.params;
    const userIdParsed = parseInt(user_id, 10);
    if (!userIdParsed) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required',
        data: null,
      });
    }

    try {
      // Logic to fetch comments by userIdParsed goes here
      const comments = await CommentModel.find({ user_ref: userIdParsed });
      return res.status(200).json({
        success: true,
        message: 'Danh sách bình luận theo user ID',
        data: comments,
      });
    } catch (error) {
      console.error('Lỗi khi lấy bình luận:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
        data: null,
        error,
      });
    }
  }
}
 
module.exports = new CommentController();