const OrderModel = require('../models/OrderModel');
const ProductVariant = require('../models/ProductVariant');
const UserModel = require('../models/UserModel');
const PromotionModel = require('../models/PromotionModel');
const { sendOrderConfirmationEmail } = require('../../utils/emailUtil');

class OrderController {
  // [POST] /api/orders - Tạo đơn hàng mới
  async createOrder(req, res) {
    try {
      const {
        items,
        shipping_address,
        payment_method,
        customer_note,
        loyalty_points_used = 0,
        promotion_code // THÊM MỚI
      } = req.body;
      
      const customer_id = req.user.id;
      
      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Giỏ hàng trống'
        });
      }
      
      // Validate shipping address
      if (!shipping_address || !shipping_address.full_name || !shipping_address.phone || !shipping_address.address) {
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin địa chỉ giao hàng'
        });
      }
      
      // Kiểm tra tồn kho và tính giá
      let orderItems = [];
      let subtotal = 0;
      
      for (let item of items) {
        const variant = await ProductVariant.findById(item.variant_id)
          .populate('product_id');
        
        if (!variant) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy biến thể sản phẩm ${item.variant_id}`
          });
        }
        
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm ${variant.product_id.name} chỉ còn ${variant.stock} trong kho`
          });
        }
        
        const itemTotal = variant.price * item.quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          product_id: variant.product_id._id,
          variant_id: variant._id,
          SKU: variant.SKU,
          name: variant.product_id.name,
          attributes: variant.attributes,
          image_url: item.image_url,
          price: variant.price,
          quantity: item.quantity,
          total_price: itemTotal
        });
        
        // Trừ tồn kho
        variant.stock -= item.quantity;
        await variant.save();
      }
      
      // Tính phí vận chuyển
      const shipping_fee = subtotal >= 500000 ? 0 : 30000;
      const tax_amount = 0;
      
      // Xử lý promotion code - THÊM MỚI
      let promotion_discount = 0;
      let promotion_used = null;
      
      if (promotion_code) {
        const promotion = await PromotionModel.findOne({
          code: promotion_code.toUpperCase(),
          status: 'ACTIVE'
        });
        
        if (promotion) {
          // Validate promotion
          const now = new Date();
          const isValidTime = promotion.start_date <= now && promotion.end_date >= now;
          const hasUsageLeft = !promotion.usage_limit || promotion.used_count < promotion.usage_limit;
          const meetsMinOrder = subtotal >= promotion.min_order_amount;
          
          if (isValidTime && hasUsageLeft && meetsMinOrder) {
            // Tính discount amount
            promotion_discount = promotion.calculateDiscount(subtotal);
            
            if (promotion_discount > 0) {
              promotion_used = {
                promotion_id: promotion._id,
                code: promotion.code,
                name: promotion.name,
                discount_type: promotion.discount_type,
                discount_value: promotion.discount_value,
                discount_amount: promotion_discount
              };
              
              // Tăng used_count
              promotion.used_count += 1;
              await promotion.save();
            }
          } else {
            // Rollback stock nếu promotion không hợp lệ
            for (let item of orderItems) {
              await ProductVariant.findByIdAndUpdate(
                item.variant_id,
                { $inc: { stock: item.quantity } }
              );
            }
            
            let errorMessage = 'Mã giảm giá không hợp lệ';
            if (!isValidTime) {
              errorMessage = promotion.start_date > now ? 'Mã giảm giá chưa có hiệu lực' : 'Mã giảm giá đã hết hạn';
            } else if (!hasUsageLeft) {
              errorMessage = 'Mã giảm giá đã hết lượt sử dụng';
            } else if (!meetsMinOrder) {
              errorMessage = `Đơn hàng tối thiểu ${promotion.min_order_amount.toLocaleString()}đ để sử dụng mã này`;
            }
            
            return res.status(400).json({
              success: false,
              message: errorMessage
            });
          }
        } else {
          // Rollback stock nếu promotion không tồn tại
          for (let item of orderItems) {
            await ProductVariant.findByIdAndUpdate(
              item.variant_id,
              { $inc: { stock: item.quantity } }
            );
          }
          
          return res.status(400).json({
            success: false,
            message: 'Mã giảm giá không tồn tại'
          });
        }
      }
      
      // Validate loyalty points
      const user = await UserModel.findById(customer_id);
      if (loyalty_points_used > (user.loyalty_points || 0)) {
        // Rollback nếu không đủ điểm
        for (let item of orderItems) {
          await ProductVariant.findByIdAndUpdate(
            item.variant_id,
            { $inc: { stock: item.quantity } }
          );
        }
        
        // Rollback promotion usage
        if (promotion_used) {
          await PromotionModel.findByIdAndUpdate(
            promotion_used.promotion_id,
            { $inc: { used_count: -1 } }
          );
        }
        
        return res.status(400).json({
          success: false,
          message: `Bạn chỉ có ${user.loyalty_points || 0} điểm tích lũy`
        });
      }
      
      // Tính tổng giảm giá và số tiền cuối cùng
      const loyalty_discount = loyalty_points_used;
      const total_discount = promotion_discount + loyalty_discount;
      const total_amount = Math.max(0, subtotal + shipping_fee + tax_amount - total_discount);
      
      // Validate final amount
      if (total_amount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Tổng số tiền không hợp lệ'
        });
      }
      
      // Tạo đơn hàng
      const newOrder = new OrderModel({
        customer_id,
        items: orderItems,
        subtotal,
        shipping_fee,
        tax_amount,
        discount_amount: total_discount,
        loyalty_points_used,
        promotion_used, // THÊM MỚI
        total_amount,
        shipping_address,
        payment_method,
        customer_note,
        status: "PENDING",
        status_history: [{
          status: "PENDING",
          timestamp: new Date(),
          note: "Đơn hàng được tạo"
        }]
      });
      
      await newOrder.save();
      
      // Cập nhật điểm tích lũy của user (trừ điểm đã sử dụng)
      if (loyalty_points_used > 0) {
        user.loyalty_points = (user.loyalty_points || 0) - loyalty_points_used;
        await user.save();
      }
      
      let responseData = {
        order: newOrder,
        loyalty_points_used: loyalty_points_used,
        promotion_discount: promotion_discount,
        new_loyalty_balance: user.loyalty_points
      };
      
      // Xử lý thanh toán
      if (payment_method === 'VNPAY') {
        const PaymentModel = require('../models/PaymentModel');
        
        // Tạo payment record
        const payment = new PaymentModel({
          order_id: newOrder._id,
          customer_id,
          payment_method: 'VNPAY',
          amount: newOrder.total_amount,
          status: 'PENDING',
          expired_at: new Date(Date.now() + 15 * 60 * 1000),
          vnpay_transaction_id: `${newOrder._id}_${Date.now()}`
        });
        
        await payment.save();
        
        // Tạo VNPay URL
        const VNPayService = require('../../services/VNPayService');
        const orderInfo = `Thanh toan don hang ${newOrder.order_number}`;
        const paymentUrl = VNPayService.createPaymentUrl(
          req,
          payment.vnpay_transaction_id,
          newOrder.total_amount,
          orderInfo
        );
        
        responseData.payment = {
          payment_id: payment._id,
          payment_url: paymentUrl,
          expired_at: payment.expired_at
        };
      } else {
        // COD - gửi email xác nhận ngay
        if (user.email) {
          sendOrderConfirmationEmail(user.email, newOrder)
            .then(result => {
              if (result.success) {
                console.log(`✅ Email confirmation sent successfully to ${user.email}`);
              } else {
                console.log(`⚠️ Email confirmation failed: ${result.error}`);
              }
            })
            .catch(error => {
              console.error(`❌ Email confirmation error: ${error.message}`);
            });
        }
      }
      
      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công',
        data: responseData
      });
      
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo đơn hàng',
        error: error.message
      });
    }
  }
  
  // [GET] /api/orders - Lấy danh sách đơn hàng của user
  async getMyOrders(req, res) {
    try {
      const customer_id = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      
      let filter = { customer_id };
      if (status) {
        filter.status = status;
      }
      
      const skip = (page - 1) * limit;
      
      const [orders, total] = await Promise.all([
        OrderModel.find(filter)
          .populate('items.product_id', 'name slug')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        OrderModel.countDocuments(filter)
      ]);
      
      res.json({
        success: true,
        data: orders,
        meta: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total
        }
      });
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [GET] /api/orders/:id - Chi tiết đơn hàng
  async getOrderDetail(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const customer_id = req.user.id;
      
      const order = await OrderModel.findOne({
        _id: orderId,
        customer_id
      })
      .populate('items.product_id', 'name slug images')
      .populate('promotion_used.promotion_id', 'code name description')
      .lean();
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
      
    } catch (error) {
      console.error('Error fetching order detail:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [PATCH] /api/orders/:id/cancel - Hủy đơn hàng
  async cancelOrder(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const customer_id = req.user.id;
      const { reason } = req.body;
      
      const order = await OrderModel.findOne({
        _id: orderId,
        customer_id
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }
      
      // Chỉ cho phép hủy ở trạng thái PENDING hoặc CONFIRMED
      if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy đơn hàng ở trạng thái hiện tại'
        });
      }
      
      // Hoàn lại tồn kho
      for (let item of order.items) {
        await ProductVariant.findByIdAndUpdate(
          item.variant_id,
          { $inc: { stock: item.quantity } }
        );
      }
      
      // Hoàn lại điểm tích lũy đã sử dụng
      if (order.loyalty_points_used > 0) {
        await UserModel.findByIdAndUpdate(
          customer_id,
          { $inc: { loyalty_points: order.loyalty_points_used } }
        );
      }
      
      // Hoàn lại lượt sử dụng promotion - THÊM MỚI
      if (order.promotion_used && order.promotion_used.promotion_id) {
        await PromotionModel.findByIdAndUpdate(
          order.promotion_used.promotion_id,
          { $inc: { used_count: -1 } }
        );
      }
      
      // Cập nhật trạng thái
      order.status = 'CANCELLED';
      order.status_history.push({
        status: 'CANCELLED',
        timestamp: new Date(),
        note: reason || 'Khách hàng hủy đơn'
      });
      
      await order.save();
      
      res.json({
        success: true,
        message: 'Hủy đơn hàng thành công',
        data: order
      });
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [PATCH] /api/orders/:id/status - Cập nhật trạng thái (Admin only)
  async updateOrderStatus(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      const { status, note } = req.body;
      const updated_by = req.user.id;
      
      const order = await OrderModel.findById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }
      
      const validStatuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED", "REFUNDED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ'
        });
      }
      
      // Xử lý logic đặc biệt khi chuyển sang CANCELLED hoặc REFUNDED
      if (['CANCELLED', 'REFUNDED'].includes(status) && !['CANCELLED', 'REFUNDED'].includes(order.status)) {
        // Hoàn lại tồn kho
        for (let item of order.items) {
          await ProductVariant.findByIdAndUpdate(
            item.variant_id,
            { $inc: { stock: item.quantity } }
          );
        }
        
        // Hoàn lại điểm tích lũy đã sử dụng
        if (order.loyalty_points_used > 0) {
          await UserModel.findByIdAndUpdate(
            order.customer_id,
            { $inc: { loyalty_points: order.loyalty_points_used } }
          );
        }
        
        // Hoàn lại lượt sử dụng promotion
        if (order.promotion_used && order.promotion_used.promotion_id) {
          await PromotionModel.findByIdAndUpdate(
            order.promotion_used.promotion_id,
            { $inc: { used_count: -1 } }
          );
        }
      }
      
      // Xử lý khi đơn hàng DELIVERED - tặng điểm tích lũy
      if (status === 'DELIVERED' && order.status !== 'DELIVERED') {
        const pointsToEarn = Math.floor(order.total_amount / 1000); // 1 điểm per 1000 VND
        
        await UserModel.findByIdAndUpdate(
          order.customer_id,
          { $inc: { loyalty_points: pointsToEarn } }
        );
        
        order.loyalty_points_earned = pointsToEarn;
      }
      
      order.status = status;
      order.status_history.push({
        status,
        timestamp: new Date(),
        note: note || `Cập nhật trạng thái thành ${status}`,
        updated_by
      });
      
      await order.save();
      
      res.json({
        success: true,
        message: 'Cập nhật trạng thái thành công',
        data: order
      });
      
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // [GET] /api/orders/admin/all - Lấy tất cả đơn hàng (Admin only)
  async getAllOrdersForAdmin(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status,
        date_range, // today, yesterday, this_week, this_month, custom
        start_date,
        end_date,
        search // tìm theo order_number, customer name, phone
      } = req.query;
      
      let filter = {};
      
      // Filter theo status
      if (status) {
        filter.status = status;
      }
      
      // Filter theo thời gian
      if (date_range) {
        const now = new Date();
        let startDate, endDate;
        
        switch (date_range) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'this_week':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
            endDate = new Date();
            break;
          case 'this_month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            break;
          case 'custom':
            if (start_date) startDate = new Date(start_date);
            if (end_date) endDate = new Date(end_date);
            break;
        }
        
        if (startDate || endDate) {
          filter.createdAt = {};
          if (startDate) filter.createdAt.$gte = startDate;
          if (endDate) filter.createdAt.$lt = endDate;
        }
      }
      
      const skip = (page - 1) * limit;
      
      // Pipeline cho aggregation (để search customer info)
      const pipeline = [
        { $match: filter },
        {
          $lookup: {
            from: 'users',
            localField: 'customer_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        { $unwind: '$customer' }
      ];
      
      // Thêm search nếu có
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { order_number: { $regex: search, $options: 'i' } },
              { 'customer.full_name': { $regex: search, $options: 'i' } },
              { 'customer.phone': { $regex: search, $options: 'i' } },
              { 'customer.email': { $regex: search, $options: 'i' } }
            ]
          }
        });
      }
      
      // Sort by newest first
      pipeline.push({ $sort: { createdAt: -1 } });
      
      // Pagination
      const [orders, totalPipeline] = await Promise.all([
        OrderModel.aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $project: {
              _id: 1,
              order_number: 1,
              customer_id: 1,
              'customer.full_name': 1,
              'customer.phone': 1,
              'customer.email': 1,
              subtotal: 1,
              total_amount: 1,
              discount_amount: 1,
              loyalty_points_used: 1,
              promotion_used: 1,
              status: 1,
              payment_method: 1,
              createdAt: 1,
              'items.name': 1,
              'items.quantity': 1,
              'items.image_url': 1,
              'items.total_price': 1
            }
          }
        ]),
        OrderModel.aggregate([
          ...pipeline,
          { $count: "total" }
        ])
      ]);
      
      const total = totalPipeline[0]?.total || 0;
      
      res.json({
        success: true,
        data: orders,
        meta: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          limit: parseInt(limit)
        }
      });
      
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // [GET] /api/orders/admin/:id - Chi tiết đơn hàng (Admin)
  async getOrderDetailForAdmin(req, res) {
    try {
      const orderId = parseInt(req.params.id);
      
      const order = await OrderModel.findById(orderId)
        .populate('customer_id', 'full_name phone email')
        .populate('items.product_id', 'name slug images')
        .populate('promotion_used.promotion_id', 'code name description')
        .lean();
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng'
        });
      }
      
      res.json({
        success: true,
        data: order
      });
      
    } catch (error) {
      console.error('Error fetching admin order detail:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // [GET] /api/orders/stats/summary - Thống kê tổng quan (Admin)
  async getOrderStatistics(req, res) {
    try {
      const { period = 'month' } = req.query; // day, week, month, year
      
      const now = new Date();
      let startDate;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      const [stats] = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total_amount' },
            totalDiscount: { $sum: '$discount_amount' },
            promotionUsage: { 
              $sum: { 
                $cond: [{ $ne: ['$promotion_used', null] }, 1, 0] 
              } 
            },
            loyaltyPointsUsed: { $sum: '$loyalty_points_used' },
            avgOrderValue: { $avg: '$total_amount' },
            statusBreakdown: {
              $push: '$status'
            }
          }
        }
      ]);
      
      // Status breakdown
      const statusCounts = {};
      if (stats && stats.statusBreakdown) {
        stats.statusBreakdown.forEach(status => {
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });
      }
      
      res.json({
        success: true,
        data: {
          ...stats,
          statusBreakdown: statusCounts,
          period,
          startDate,
          endDate: now
        }
      });
      
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
}

module.exports = new OrderController();