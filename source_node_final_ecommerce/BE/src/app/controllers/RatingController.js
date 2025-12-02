const RatingModel = require('../models/RatingModel');
const ProductModel = require('../models/ProductModel');
const { sentNotificationToAdmin } = require('../../services/notificationService');
const { ADMIN_NOTIFICATIONS } = require('../../constants/notifyContants');

class RatingController {
  // [GET] | /api/ratings/:user_id/update-rate/:product_id
  async getRatingByUserAndProduct(req, res) {
    const { user_id, product_id } = req.params;
    const userIdParsed = parseInt(user_id, 10);
    const prodIdParsed = parseInt(product_id, 10);
    if (!userIdParsed || !prodIdParsed) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Product ID are required',
        data: null,
      });
    }
    try {
      // Logic to fetch rating by userIdParsed and prodIdParsed goes here
      const ratingDoc = await RatingModel.findOne({
        user_id: userIdParsed,
        product_id: prodIdParsed,
      });
      return res.status(200).json({
        success: true,
        message: 'Lấy đánh giá theo user ID và product ID thành công',
        data: ratingDoc,
      });
    } catch (error) {
      console.error('Lỗi khi lấy đánh giá:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
        data: null,
        error,
      });
    }
  }

  // [GET] /api/ratings/:product_id/ratings-by-product
  async ratingsByProductId(req, res) {
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
      // // Logic to fetch ratings by prodIdParsed goes here
      // const ratings = await RatingModel.find({ product_id: prodIdParsed });

      // // thống kê
      // const averageRating = await RatingModel.aggregate([
      //     { $match: { product_id: prodIdParsed } },
      //     { $group: {
      //         _id: '$product_id',
      //         averageRating: { $avg: '$rating' },
      //         ratings: { $sum: 1 },
      //     }},
      // ]);

      const [ratings, average_rating] = await Promise.all([
        RatingModel.find({ product_id: prodIdParsed }),
        RatingModel.aggregate([
          { $match: { product_id: prodIdParsed } },
          {
            $group: {
              _id: '$product_id',
              average_rating: { $avg: '$rating' },
              ratings: { $sum: 1 },
            },
          },
        ]),
      ]);

      return res.status(200).json({
        success: true,
        message: 'Danh sách đánh giá theo product ID',
        data: ratings,
        average_rating: average_rating[0] || { average_rating: 0, ratings: 0 },
      });
    } catch (error) {
      console.error('Lỗi khi lấy đánh giá:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
        data: null,
        error,
      });
    }
  }

  // [PUT] /api/ratings/:user_id/update-rate/:product_id
  async rateProduct(req, res) {
    const { user_id, product_id } = req.params;
    const { value, content } = req.body;
    const userIdParsed = parseInt(user_id, 10);
    const prodIdParsed = parseInt(product_id, 10);
    if (!userIdParsed || !prodIdParsed) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Product ID are required',
        data: null,
      });
    }

    if (value < 1 || value > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating value must be between 1 and 5',
        data: null,
      });
    }

    try {
      // Logic to create or update rating goes here
      let ratingDoc = await RatingModel.findOne({
        user_id: userIdParsed,
        product_id: prodIdParsed,
      });
      if (ratingDoc) {
        // Update existing rating
        ratingDoc.rating = value;
        ratingDoc.content = content;
        await ratingDoc.save();
      } else {
        // Create new rating
        ratingDoc = new RatingModel({
          user_id: userIdParsed,
          product_id: prodIdParsed,
          content: content,
          rating: value,
        });
        await ratingDoc.save();
      }

      // thông kê lại
      const aggregationResult = await RatingModel.aggregate([
        { $match: { product_id: prodIdParsed } },
        {
          $group: {
            _id: '$product_id',
            new_average: { $avg: '$rating' },
            new_count: { $sum: 1 },
          },
        },
      ]);

      const data = aggregationResult[0] || { new_average: 0, new_count: 0 };
      console.log('New aggregation data:', data);

      // có data cập nhật lại product's average rating nếu cần
      const existPro = await ProductModel.findById(prodIdParsed);
      if (existPro) {
        existPro.average_rating = data.new_average;
        existPro.review_count = data.new_count;
        await existPro.save();
      }

      // socket
      const io = req.app.get('io');
      io.to(`product_${prodIdParsed}`).emit('rating:updated', {
        _id: ratingDoc._id,
        product_id: prodIdParsed,
        my_value: value,
        user_id: userIdParsed,
        new_average: data.new_average,
        new_count: data.new_count,
      });

      // find user để lấy thông tin nếu cần 
      const user = req.user || null;
      const admin_ids = [3, 17]; // tạm thời user admin ID là 3, 17
      await Promise.all(admin_ids.map(async (admin_id) => {
        await sentNotificationToAdmin({
          user_id: admin_id,
          type: 'PRODUCT_REVIEWED',
          title: `Đánh giá mới trên sản phẩm #${existPro.name || prodIdParsed}`,
          message: `User: ${user.email || user.full_name} - ${value} sao - "${content.slice(0, 80)}..."`,
          link: `/admin/products/${prodIdParsed}/detail`,
        });
      }));

      return res.status(200).json({
        success: true,
        message: 'Đánh giá sản phẩm thành công',
        data: ratingDoc,
      });
    } catch (error) {
      console.error('Lỗi khi đánh giá sản phẩm:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
        data: null,
        error,
      });
    }
  }

  // [GET] /api/ratings/:user_id/ratings-by-user
  async ratingsByUserId(req, res) {
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
      // Logic to fetch ratings by userIdParsed goes here
      const ratings = await RatingModel.find({ user_ref: userIdParsed });
      return res.status(200).json({
        success: true,
        message: 'Danh sách đánh giá theo user ID',
        data: ratings,
      });
    } catch (error) {
      console.error('Lỗi khi lấy đánh giá:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server: ' + error.message,
        data: null,
        error,
      });
    }
  }
}

module.exports = new RatingController();
