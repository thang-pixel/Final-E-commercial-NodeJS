const OrderModel = require('../models/OrderModel');
const UserModel = require('../models/UserModel');

class HomeController {
  // [GET] | /
  index(req, res) {
    res.status(200).json({ message: 'Home route is working' });
  }

  // [GET] | /api/home/new-products
  async newProducts(req, res) {
    res.status(200).json({ message: 'New Products route is working' });
  }

  // [GET] | /api/home/best-sellers
  async getBestSellerProducts(req, res, next) {
    const limit = req.query.limit || 10;

    try {
      const pipeline = [
        // 1. Chỉ lấy các đơn "đã bán"
        {
          $match: {
            status: {
              $in: ['CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'],
            },
            // nếu chắc chắn không muốn tính đơn đã xóa mềm:
            // deleted: { $ne: true }
          },
        },

        // 2. Bung từng item trong order
        { $unwind: '$items' },

        // 3. Group theo product_id
        {
          $group: {
            _id: '$items.product_id', // product_id là Number
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.total_price' },
          },
        },

        // 4. Sort theo số lượng bán
        { $sort: { totalQuantity: -1, totalRevenue: -1 } },

        // 5. Giới hạn số lượng hiển thị
        { $limit: Number(limit) },

        // 6. Lookup sang Product
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id', // vì Product _id là Number
            as: 'product',
          },
        },
        { $unwind: '$product' },

        // 7. Lọc chỉ product ACTIVE + chưa bị xóa mềm
        {
          $match: {
            'product.status': 'ACTIVE',
            'product.deleted': { $ne: true },
          },
        },

        // 8. Lấy ra thumbnail nếu có
        {
          $addFields: {
            thumbnailObj: {
              $first: {
                $filter: {
                  input: '$product.images',
                  as: 'img',
                  cond: { $eq: ['$$img.type', 'THUMBNAIL'] },
                },
              },
            },
          },
        },

        // 9. Project dữ liệu trả về cho UI
        {
          $project: {
            _id: 0,
            product_id: '$product._id',
            name: '$product.name',
            slug: '$product.slug',

            // ảnh: ưu tiên thumbnail, nếu không có thì lấy ảnh đầu tiên trong mảng
            image_url: {
              $ifNull: [
                '$thumbnailObj.img_url',
                { $arrayElemAt: ['$product.images.img_url', 0] },
              ],
            },

            min_price: '$product.min_price',
            max_price: '$product.max_price',
            average_rating: '$product.average_rating',
            review_count: '$product.review_count',

            totalQuantity: 1,
            totalRevenue: 1,
          },
        },
      ];

      const bestSellers = await OrderModel.aggregate(pipeline);
      res.status(200).json({
        message: 'Best Sellers fetched successfully',
        data: bestSellers,
      });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new HomeController();
