const PromotionModel = require('../models/PromotionModel');
const OrderModel = require('../models/OrderModel');

// Helper function - di chuyển ra ngoài class
const checkPromotionValid = (promotion) => {
  const now = new Date();
  return promotion.status === 'ACTIVE' && 
         promotion.start_date <= now && 
         promotion.end_date >= now &&
         (promotion.usage_limit === null || promotion.used_count < promotion.usage_limit);
};

class PromotionController {
  // [GET] /api/promotions - Lấy danh sách promotion (Admin)
  async index(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        search,
        status,
        discount_type 
      } = req.query;
      
      let filter = {};
      
      if (search) {
        filter.$or = [
          { code: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) {
        filter.status = status;
      }
      
      if (discount_type) {
        filter.discount_type = discount_type;
      }
      
      const skip = (page - 1) * limit;
      
      const [promotions, total] = await Promise.all([
        PromotionModel.find(filter)
          .populate('created_by', 'full_name')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        PromotionModel.countDocuments(filter)
      ]);
      
      // Thêm thống kê sử dụng - SỬA LỖI
      const promotionsWithStats = await Promise.all(
        promotions.map(async (promotion) => {
          // Đếm số đơn hàng đã sử dụng promotion này
          const ordersUsed = await OrderModel.find({
            'promotion_used.code': promotion.code
          }).countDocuments();
          
          return {
            ...promotion,
            orders_used_count: ordersUsed,
            remaining_usage: promotion.usage_limit ? promotion.usage_limit - promotion.used_count : null,
            is_valid: checkPromotionValid(promotion) // SỬA: gọi function standalone
          };
        })
      );
      
      res.json({
        success: true,
        data: promotionsWithStats,
        meta: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      });
      
    } catch (error) {
      console.error('Error fetching promotions:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [GET] /api/promotions/:id - Chi tiết promotion với danh sách đơn hàng
  async detail(req, res) {
    try {
      const { id } = req.params;
      
      const promotion = await PromotionModel.findById(id)
        .populate('created_by', 'full_name email')
        .populate('applicable_products', 'name')
        .populate('applicable_categories', 'name');
      
      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy promotion'
        });
      }
      
      // Lấy danh sách đơn hàng đã sử dụng promotion này
      const ordersUsed = await OrderModel.find({
        'promotion_used.code': promotion.code
      })
        .populate('customer_id', 'full_name email phone')
        .select('_id order_number customer_id total_amount promotion_used createdAt')
        .sort({ createdAt: -1 })
        .lean();
      
      res.json({
        success: true,
        data: {
          promotion,
          orders_used: ordersUsed,
          statistics: {
            total_orders: ordersUsed.length,
            total_discount_given: ordersUsed.reduce((sum, order) => 
              sum + (order.promotion_used?.discount_amount || 0), 0
            ),
            remaining_usage: promotion.usage_limit ? 
              promotion.usage_limit - promotion.used_count : null
          }
        }
      });
      
    } catch (error) {
      console.error('Error fetching promotion detail:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [POST] /api/promotions - Tạo promotion mới (Admin)
  async store(req, res) {
    try {
      const {
        code,
        name,
        description,
        discount_type,
        discount_value,
        max_discount_amount,
        min_order_amount,
        usage_limit,
        start_date,
        end_date,
        applicable_to,
        applicable_products,
        applicable_categories
      } = req.body;
      
      const created_by = req.user.id;
      
      // Validate
      if (!code || !name || !discount_type || !discount_value || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc'
        });
      }
      
      // Check duplicate code
      const existingPromotion = await PromotionModel.findOne({ code: code.toUpperCase() });
      if (existingPromotion) {
        return res.status(400).json({
          success: false,
          message: 'Mã giảm giá đã tồn tại'
        });
      }
      
      // Validate dates
      if (new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({
          success: false,
          message: 'Ngày bắt đầu phải trước ngày kết thúc'
        });
      }
      
      // Validate discount value
      if (discount_type === 'PERCENTAGE' && (discount_value < 0 || discount_value > 100)) {
        return res.status(400).json({
          success: false,
          message: 'Phần trăm giảm giá phải từ 0-100'
        });
      }
      
      const newPromotion = new PromotionModel({
        code: code.toUpperCase(),
        name,
        description,
        discount_type,
        discount_value,
        max_discount_amount,
        min_order_amount: min_order_amount || 0,
        usage_limit,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        applicable_to: applicable_to || 'ALL',
        applicable_products: applicable_products || [],
        applicable_categories: applicable_categories || [],
        created_by
      });
      
      await newPromotion.save();
      
      res.status(201).json({
        success: true,
        message: 'Tạo mã giảm giá thành công',
        data: newPromotion
      });
      
    } catch (error) {
      console.error('Error creating promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [PUT] /api/promotions/:id - Cập nhật promotion (Admin)
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy promotion'
        });
      }
      
      // Không cho phép sửa code nếu đã có đơn hàng sử dụng
      if (updateData.code && updateData.code !== promotion.code && promotion.used_count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể thay đổi mã đã được sử dụng'
        });
      }
      
      Object.assign(promotion, updateData);
      await promotion.save();
      
      res.json({
        success: true,
        message: 'Cập nhật promotion thành công',
        data: promotion
      });
      
    } catch (error) {
      console.error('Error updating promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [DELETE] /api/promotions/:id - Xóa promotion (Admin)
  async destroy(req, res) {
    try {
      const { id } = req.params;
      
      const promotion = await PromotionModel.findById(id);
      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy promotion'
        });
      }
      
      // Không cho phép xóa nếu đã có đơn hàng sử dụng
      if (promotion.used_count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa mã đã được sử dụng'
        });
      }
      
      await promotion.delete();
      
      res.json({
        success: true,
        message: 'Xóa promotion thành công'
      });
      
    } catch (error) {
      console.error('Error deleting promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [POST] /api/promotions/validate - Validate promotion code (Customer)
  async validatePromotion(req, res) {
    try {
      const { code, order_amount } = req.body;
      
      if (!code || !order_amount) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin mã giảm giá hoặc số tiền đơn hàng'
        });
      }
      
      const promotion = await PromotionModel.findOne({
        code: code.toUpperCase(),
        status: 'ACTIVE'
      });
      
      if (!promotion) {
        return res.status(404).json({
          success: false,
          message: 'Mã giảm giá không tồn tại'
        });
      }
      
      // Check validity
      const now = new Date();
      if (promotion.start_date > now) {
        return res.status(400).json({
          success: false,
          message: 'Mã giảm giá chưa có hiệu lực'
        });
      }
      
      if (promotion.end_date < now) {
        return res.status(400).json({
          success: false,
          message: 'Mã giảm giá đã hết hạn'
        });
      }
      
      if (promotion.usage_limit && promotion.used_count >= promotion.usage_limit) {
        return res.status(400).json({
          success: false,
          message: 'Mã giảm giá đã hết lượt sử dụng'
        });
      }
      
      if (order_amount < promotion.min_order_amount) {
        return res.status(400).json({
          success: false,
          message: `Đơn hàng tối thiểu ${promotion.min_order_amount.toLocaleString()}đ để sử dụng mã này`
        });
      }
      
      // Calculate discount
      const discountAmount = promotion.calculateDiscount(order_amount);
      
      res.json({
        success: true,
        message: 'Mã giảm giá hợp lệ',
        data: {
          promotion_id: promotion._id,
          code: promotion.code,
          name: promotion.name,
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
          discount_amount: discountAmount,
          max_discount_amount: promotion.max_discount_amount,
          min_order_amount: promotion.min_order_amount
        }
      });
      
    } catch (error) {
      console.error('Error validating promotion:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // Helper function
  checkPromotionValid(promotion) {
    const now = new Date();
    return promotion.status === 'ACTIVE' && 
           promotion.start_date <= now && 
           promotion.end_date >= now &&
           (promotion.usage_limit === null || promotion.used_count < promotion.usage_limit);
  }
}

module.exports = new PromotionController();