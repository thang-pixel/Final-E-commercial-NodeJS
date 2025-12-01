const OrderModel = require('../models/OrderModel');
const ProductVariant = require('../models/ProductVariant');
const UserModel = require('../models/UserModel');
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
        loyalty_points_used = 0
      } = req.body;
      
      const customer_id = req.user.id;
      
      // Validate items
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Giỏ hàng trống'
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
      
      // Tính phí và tổng tiền
      const shipping_fee = subtotal >= 500000 ? 0 : 30000;
      const tax_amount = 0;
      const discount_amount = loyalty_points_used;
      
      const total_amount = subtotal + shipping_fee + tax_amount - discount_amount;
      
      // Tạo đơn hàng (giữ nguyên logic cũ)
      const newOrder = new OrderModel({
        customer_id,
        items: orderItems,
        subtotal,
        shipping_fee,
        tax_amount,
        discount_amount,
        loyalty_points_used,
        total_amount,
        shipping_address,
        payment_method,
        customer_note,
        status: "PENDING"
      });
      
      await newOrder.save();
      
      // Cập nhật điểm tích lũy (chỉ trừ điểm đã dùng, chưa cộng điểm mới)
      const user = await UserModel.findById(customer_id);
      user.loyalty_points = (user.loyalty_points || 0) - loyalty_points_used;
      await user.save();
      
      let responseData = {
        order: newOrder,
        loyalty_points_earned: newOrder.loyalty_points_earned,
        new_loyalty_balance: user.loyalty_points
      };
      
      // Nếu thanh toán VNPay, tạo payment URL
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
        // COD - gửi email ngay
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

}

module.exports = new OrderController();