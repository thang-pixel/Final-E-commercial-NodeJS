const { sentNotificationToAdmin } = require('../../services/notificationService');
const { paginationParam } = require('../../utils/searchUtil');
const CommentModel = require('../models/CommentModel');
const ProductModel = require('../models/ProductModel');

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

    // meta phân trang
    const { page, limit, skip } = paginationParam(req, 5);

    try {
      // Logic to fetch comments by prodIdParsed goes here
      const [comments, total] = await Promise.all([
        CommentModel.find({ product_id: prodIdParsed })
          .sort({ createdAt: -1 })
          .populate('user_ref', '_id avatar full_name') // populate user_ref với các trường cần thiết
          .skip(skip)
          .limit(limit)
          .lean(),
        CommentModel.countDocuments({ product_id: prodIdParsed }),
      ]);

      // lấy comment theo cấp: level 1, level 2, ... về sau nha

      // tinh toán tổng số trang
      const totalPages = Math.max(1, Math.ceil(total / limit)); // luôn >= 1 để đáp ứng yêu cầu hiển thị số trang

      return res.status(200).json({
        success: true,
        message: 'Danh sách bình luận theo product ID',
        data: comments,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          isLastPage: page >= totalPages,
        },
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

  // [POST] /api/comments/:product_id/add-comment
  async createComment(req, res, next) {
    const { product_id } = req.params;
    const prodIdParsed = parseInt(product_id, 10);
    if (!prodIdParsed) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required to add comment',
        data: null,
      });
    }

    try {
      // parent comment _id và level
      const { content, display_name, parent_comment } = req.body;

      if (!content || content.trim() === '' || content.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Content is required to add comment',
          data: null,
        });
      }

      if (
        !display_name ||
        display_name.trim() === '' ||
        display_name.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Display name is required to add comment',
          data: null,
        });
      }

      const user = req.user || null;
      const user_ref = user ? user.id : null;
      console.log('User adding comment:', user);
      const name = display_name ? display_name : 'Guest';

      console.log('Creating comment with data:', {
        product_id: prodIdParsed,
        user_ref,
        display_name: name,
        content,
        parent_comment,
      });
      const newComment = new CommentModel({
        product_id: prodIdParsed,
        user_ref: user_ref || null,
        display_name: name,
        content,
        parent_id: parent_comment ? parent_comment._id : null,
        level: parent_comment ? parent_comment.level + 1 : 1,
      });

      console.log('New comment created:', newComment);

      const savedComment = await newComment.save();

      // socket
      const io = req.app.get('io');
      io.to(`product_${prodIdParsed}`).emit('comment:new', {
        _id: savedComment._id,
        product_id: prodIdParsed,
        user_ref: savedComment.user_ref,
        display_name: savedComment.display_name,
        content: savedComment.content,
        parent_id: savedComment.parent_id,
        level: savedComment.level,
        createdAt: savedComment.createdAt,
      });

      // gửi thông báo đến admin về bình luận mới
      // find product để lấy thông tin nếu cần
      const pro = await ProductModel.findById(prodIdParsed).lean();
      if (!pro) {
        console.warn(
          `Product with ID ${prodIdParsed} not found while sending comment notification`
        );
      }


      const admin_ids = [3, 17]; // tạm thời user admin ID là 3, 17
      await Promise.all(admin_ids.map(async (admin_id) => {
        await sentNotificationToAdmin({
          user_id: admin_id,
          type: 'PRODUCT_REVIEWED',
          title: `Bình luận mới trên sản phẩm #${pro.name || prodIdParsed}`,
          message: `User: ${user.email || name} - "${content.slice(0, 80)}..."`,
          link: `/admin/products/${pro._id || prodIdParsed}/detail`,
        });
      }));

      return res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: savedComment,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error: ' + error.message,
        data: null,
        error,
      });
    }
  }

  // [DELETE] /api/comments/:comment_id
  async deleteCommentById(req, res) {
    const { comment_id } = req.params;
    console.log('Request to delete comment with ID:', comment_id);
    const commentIdParsed = comment_id;
    if (!commentIdParsed) {
      return res.status(400).json({
        success: false,
        message: 'Comment ID is required to delete comment',
        data: null,
      });
    }
    try {
      const deletedComment = await CommentModel.delete({ _id: commentIdParsed });
      if (!deletedComment) {
        return res.status(404).json({
          success: false,
          message: 'Comment not found', 
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
        data: deletedComment,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error: ' + error.message, 
        error,
      });
    }
  }
}
module.exports = new CommentController();
