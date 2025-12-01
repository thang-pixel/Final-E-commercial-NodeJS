const OrderModel = require('../models/OrderModel');
const ProductVariant = require('../models/ProductVariant');
const UserModel = require('../models/UserModel');
const PromotionModel = require('../models/PromotionModel');
const { sendOrderConfirmationEmail } = require('../../utils/emailUtil');

// SHIPPING METHODS CONFIGURATION
const SHIPPING_METHODS = {
  ECONOMY: {
    name: 'Giao hàng tiết kiệm',
    code: 'ECONOMY',
    estimated_days: '5-7 ngày',
    base_fee: 15000,
    description: 'Giao hàng chậm nhưng tiết kiệm chi phí'
  },
  STANDARD: {
    name: 'Giao hàng tiêu chuẩn',
    code: 'STANDARD', 
    estimated_days: '3-5 ngày',
    base_fee: 30000,
    description: 'Giao hàng với thời gian vừa phải'
  },
  FAST: {
    name: 'Giao hàng nhanh',
    code: 'FAST',
    estimated_days: '1-2 ngày',
    base_fee: 50000,
    description: 'Giao hàng nhanh trong 1-2 ngày'
  },
  EXPRESS: {
    name: 'Giao hàng hỏa tốc',
    code: 'EXPRESS',
    estimated_days: 'Trong ngày',
    base_fee: 80000,
    description: 'Giao hàng trong ngày (chỉ áp dụng nội thành)'
  }
};

// HELPER FUNCTION - Moved outside class để có thể dùng độc lập
const calculateShippingFee = (subtotal, shippingMethod = 'STANDARD') => {
  const method = SHIPPING_METHODS[shippingMethod];
  if (!method) {
    return SHIPPING_METHODS.STANDARD.base_fee;
  }
  
  let fee = method.base_fee;
  
  // Miễn phí shipping cho đơn hàng trên 500k với method ECONOMY và STANDARD
  if (subtotal >= 500000 && ['ECONOMY', 'STANDARD'].includes(shippingMethod)) {
    fee = 0;
  }
  // Giảm 50% cho FAST và EXPRESS nếu đơn hàng trên 1 triệu
  else if (subtotal >= 1000000 && ['FAST', 'EXPRESS'].includes(shippingMethod)) {
    fee = Math.floor(fee * 0.5);
  }
  
  return fee;
};

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
        promotion_code,
        shipping_method = 'STANDARD'
      } = req.body;
      
      const customer_id = req.user.id;
      
      // ========== VALIDATION ==========
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
      
      // Validate payment method
      const validPaymentMethods = ['COD', 'VNPAY', 'BANK_TRANSFER', 'E_WALLET'];
      if (!validPaymentMethods.includes(payment_method)) {
        return res.status(400).json({
          success: false,
          message: 'Phương thức thanh toán không hợp lệ'
        });
      }
      
      // Validate shipping method
      if (!SHIPPING_METHODS[shipping_method]) {
        return res.status(400).json({
          success: false,
          message: 'Phương thức vận chuyển không hợp lệ'
        });
      }
      
      // ========== KIỂM TRA USER ==========
      const user = await UserModel.findById(customer_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng'
        });
      }
      
      // ========== XỬ LÝ INVENTORY & TÍNH GIÁ ==========
      let orderItems = [];
      let subtotal = 0;
      
      // Kiểm tra và xử lý từng sản phẩm
      for (let item of items) {
        // Validate item structure
        if (!item.variant_id || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Thông tin sản phẩm không hợp lệ'
          });
        }
        
        const variant = await ProductVariant.findById(item.variant_id)
          .populate('product_id');
        
        if (!variant) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy biến thể sản phẩm ${item.variant_id}`
          });
        }
        
        // Kiểm tra product còn active không
        if (!variant.product_id || variant.product_id.status !== 'ACTIVE') {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm ${variant.product_id?.name || 'unknown'} không còn kinh doanh`
          });
        }
        
        // Kiểm tra tồn kho
        if (variant.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Sản phẩm "${variant.product_id.name}" chỉ còn ${variant.stock} trong kho`
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
          image_url: item.image_url || variant.product_id.images?.[0] || '',
          price: variant.price,
          quantity: item.quantity,
          total_price: itemTotal
        });
      }
      
      // Validate subtotal
      if (subtotal <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Tổng tiền đơn hàng không hợp lệ'
        });
      }
      
      // ========== TÍNH PHÍ VẬN CHUYỂN ==========
      const shipping_fee = calculateShippingFee(subtotal, shipping_method);
      const shipping_method_details = {
        ...SHIPPING_METHODS[shipping_method],
        fee: shipping_fee
      };
      
      console.log(`🚚 Shipping method: ${shipping_method_details.name}, Fee: ${shipping_fee.toLocaleString()}đ`);
      
      const tax_amount = 0;
      
      // ========== XỬ LÝ PROMOTION CODE ==========
      let promotion_discount = 0;
      let promotion_used = null;
      let promotionToUpdate = null;
      
      if (promotion_code && promotion_code.trim()) {
        console.log(`🎟️ Processing promotion code: ${promotion_code}`);
        
        const promotion = await PromotionModel.findOne({
          code: promotion_code.toUpperCase(),
          status: 'ACTIVE'
        });
        
        if (!promotion) {
          return res.status(400).json({
            success: false,
            message: 'Mã giảm giá không tồn tại hoặc không còn hiệu lực'
          });
        }
        
        // Validate promotion conditions
        const now = new Date();
        const isValidTime = promotion.start_date <= now && promotion.end_date >= now;
        const hasUsageLeft = !promotion.usage_limit || promotion.used_count < promotion.usage_limit;
        const meetsMinOrder = subtotal >= promotion.min_order_amount;
        
        if (!isValidTime) {
          const errorMsg = promotion.start_date > now ? 
            'Mã giảm giá chưa có hiệu lực' : 
            'Mã giảm giá đã hết hạn';
          return res.status(400).json({
            success: false,
            message: errorMsg
          });
        }
        
        if (!hasUsageLeft) {
          return res.status(400).json({
            success: false,
            message: 'Mã giảm giá đã hết lượt sử dụng'
          });
        }
        
        if (!meetsMinOrder) {
          return res.status(400).json({
            success: false,
            message: `Đơn hàng tối thiểu ${promotion.min_order_amount.toLocaleString('vi-VN')}đ để sử dụng mã này`
          });
        }
        
        // Tính discount amount
        if (promotion.discount_type === 'PERCENTAGE') {
          promotion_discount = Math.floor((subtotal * promotion.discount_value) / 100);
          
          // Áp dụng giới hạn tối đa nếu có
          if (promotion.max_discount_amount && promotion_discount > promotion.max_discount_amount) {
            promotion_discount = promotion.max_discount_amount;
          }
        } else {
          // FIXED_AMOUNT
          promotion_discount = Math.min(promotion.discount_value, subtotal);
        }
        
        if (promotion_discount > 0) {
          promotion_used = {
            promotion_id: promotion._id,
            code: promotion.code,
            name: promotion.name,
            discount_type: promotion.discount_type,
            discount_value: promotion.discount_value,
            discount_amount: promotion_discount,
            max_discount_amount: promotion.max_discount_amount
          };
          
          promotionToUpdate = promotion;
          console.log(`✅ Promotion applied: ${promotion_discount.toLocaleString('vi-VN')}đ discount`);
        }
      }
      
      // ========== VALIDATE LOYALTY POINTS ==========
      if (loyalty_points_used < 0) {
        return res.status(400).json({
          success: false,
          message: 'Số điểm tích lũy sử dụng không hợp lệ'
        });
      }
      
      if (loyalty_points_used > (user.loyalty_points || 0)) {
        return res.status(400).json({
          success: false,
          message: `Bạn chỉ có ${(user.loyalty_points || 0).toLocaleString('vi-VN')} điểm tích lũy`
        });
      }
      
      // Không cho phép sử dụng điểm nhiều hơn số tiền còn lại sau khi áp dụng promotion
      const maxPointsUsable = subtotal - promotion_discount;
      if (loyalty_points_used > maxPointsUsable) {
        return res.status(400).json({
          success: false,
          message: `Chỉ có thể sử dụng tối đa ${maxPointsUsable.toLocaleString('vi-VN')} điểm cho đơn hàng này`
        });
      }
      
      // ========== TÍNH TỔNG TIỀN ==========
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
      
      // ========== CẬP NHẬT INVENTORY & DATABASE ==========
      console.log('📦 Updating inventory...');
      
      // Trừ tồn kho
      for (let i = 0; i < orderItems.length; i++) {
        const item = items[i];
        const orderItem = orderItems[i];
        
        try {
          const updateResult = await ProductVariant.findByIdAndUpdate(
            orderItem.variant_id,
            { $inc: { stock: -item.quantity } },
            { new: true }
          );
          
          if (!updateResult) {
            // Rollback previous updates nếu có lỗi
            for (let j = 0; j < i; j++) {
              await ProductVariant.findByIdAndUpdate(
                orderItems[j].variant_id,
                { $inc: { stock: items[j].quantity } }
              );
            }
            
            return res.status(500).json({
              success: false,
              message: 'Lỗi khi cập nhật tồn kho'
            });
          }
          
          console.log(`✅ Updated stock for ${orderItem.SKU}: ${updateResult.stock}`);
        } catch (error) {
          console.error(`❌ Error updating stock for ${orderItem.SKU}:`, error);
          
          // Rollback previous updates
          for (let j = 0; j < i; j++) {
            await ProductVariant.findByIdAndUpdate(
              orderItems[j].variant_id,
              { $inc: { stock: items[j].quantity } }
            );
          }
          
          return res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật tồn kho'
          });
        }
      }
      
      // Cập nhật promotion usage
      if (promotionToUpdate) {
        promotionToUpdate.used_count += 1;
        await promotionToUpdate.save();
        console.log(`✅ Updated promotion usage: ${promotionToUpdate.code}`);
      }
      
      // Cập nhật loyalty points của user
      if (loyalty_points_used > 0) {
        user.loyalty_points = (user.loyalty_points || 0) - loyalty_points_used;
        await user.save();
        console.log(`✅ Updated user loyalty points: ${user.loyalty_points}`);
      }
      
      // ========== TẠO ĐƠN HÀNG ==========
      console.log('📝 Creating order...');
      
      const newOrder = new OrderModel({
        customer_id,
        items: orderItems,
        subtotal,
        shipping_fee,
        tax_amount,
        discount_amount: total_discount,
        loyalty_points_used,
        promotion_used,
        total_amount,
        shipping_address,
        shipping_method,
        shipping_method_details,
        payment_method,
        customer_note: customer_note || '',
        status: "PENDING",
        status_history: [{
          status: "PENDING",
          timestamp: new Date(),
          note: `Đơn hàng được tạo - Vận chuyển: ${shipping_method_details.name}`
        }]
      });
      
      await newOrder.save();
      console.log(`✅ Order created: ${newOrder.order_number} with ${shipping_method_details.name}`);
      
      // ========== PREPARE RESPONSE DATA ==========
      let responseData = {
        order: newOrder,
        loyalty_points_used: loyalty_points_used,
        promotion_discount: promotion_discount,
        new_loyalty_balance: user.loyalty_points,
        loyalty_points_earned: 0 // Sẽ được tính khi hoàn thành đơn hàng
      };
      
      // ========== XỬ LÝ THANH TOÁN VÀ GỬI EMAIL ==========
      if (payment_method === 'VNPAY') {
        console.log('💳 Processing VNPay payment...');
        
        try {
          const PaymentModel = require('../models/PaymentModel');
          
          // Tạo payment record
          const payment = new PaymentModel({
            order_id: newOrder._id,
            customer_id,
            payment_method: 'VNPAY',
            amount: newOrder.total_amount,
            status: 'PENDING',
            expired_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
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
          
          console.log(`✅ VNPay payment URL created: ${payment.vnpay_transaction_id}`);
          
          // GỬI EMAIL CHO VNPAY (đơn hàng đã tạo, chờ thanh toán)
          if (user.email) {
            console.log(`📧 Sending pending payment email to ${user.email}...`);
            
            // Không await để không block response
            sendOrderConfirmationEmail(user.email, {
              ...newOrder.toObject(),
              customer: {
                full_name: user.full_name,
                email: user.email,
                phone: user.phone,
                loyalty_points: user.loyalty_points
              },
              paymentPending: true,
              paymentExpiredAt: payment.expired_at
            })
            .then(result => {
              if (result.success) {
                console.log(`✅ Pending payment email sent to ${user.email}`);
              } else {
                console.error(`⚠️ Pending payment email failed: ${result.error}`);
              }
            })
            .catch(error => {
              console.error(`❌ Pending payment email error: ${error.message}`);
            });
          }
          
        } catch (paymentError) {
          console.error('❌ VNPay payment processing error:', paymentError);
          
          // Có thể rollback order nếu cần, nhưng ở đây chúng ta vẫn trả về order để user có thể thử lại thanh toán
          responseData.payment_error = 'Lỗi khi tạo link thanh toán VNPay';
        }
        
      } else {
        // COD, BANK_TRANSFER, E_WALLET - xác nhận đơn hàng ngay
        console.log(`💰 Processing ${payment_method} payment...`);
        
        if (user.email) {
          console.log(`📧 Sending order confirmation email to ${user.email}...`);
          
          // Không await để không block response
          sendOrderConfirmationEmail(user.email, {
            ...newOrder.toObject(),
            customer: {
              full_name: user.full_name,
              email: user.email,
              phone: user.phone,
              loyalty_points: user.loyalty_points
            },
            paymentPending: false,
            paymentMethod: payment_method
          })
          .then(result => {
            if (result.success) {
              console.log(`✅ Order confirmation email sent to ${user.email}`);
            } else {
              console.error(`⚠️ Order confirmation email failed: ${result.error}`);
            }
          })
          .catch(error => {
            console.error(`❌ Order confirmation email error: ${error.message}`);
          });
        }
      }
      
      // ========== RESPONSE ==========
      console.log(`🎉 Order creation completed successfully: ${newOrder.order_number}`);
      
      res.status(201).json({
        success: true,
        message: 'Đặt hàng thành công',
        data: responseData
      });
      
    } catch (error) {
      console.error('❌ Error creating order:', error);
      
      // Log chi tiết error để debug
      console.error('Error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo đơn hàng',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // [GET] /api/orders/shipping-methods - Lấy danh sách phương thức vận chuyển
  async getShippingMethods(req, res) {
    try {
      const { subtotal } = req.query;
      const orderSubtotal = parseFloat(subtotal) || 0;
      
      console.log(`🚚 Getting shipping methods for subtotal: ${orderSubtotal.toLocaleString()}đ`);
      
      const methods = Object.keys(SHIPPING_METHODS).map(key => {
        const method = SHIPPING_METHODS[key];
        const fee = calculateShippingFee(orderSubtotal, key); // SỬA: Gọi function độc lập thay vì this.calculateShippingFee
        
        return {
          code: key,
          name: method.name,
          estimated_days: method.estimated_days,
          fee: fee,
          original_fee: method.base_fee,
          description: method.description,
          is_free: fee === 0
        };
      });
      
      console.log(`✅ Shipping methods calculated:`, methods);
      
      res.json({
        success: true,
        data: methods
      });
      
    } catch (error) {
      console.error('❌ Error fetching shipping methods:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tải phương thức vận chuyển',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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
      
      // Hoàn lại lượt sử dụng promotion
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
        const pointsToEarn = Math.floor(order.total_amount / 10000); // 1 điểm per 10000 VND
        
        await UserModel.findByIdAndUpdate(
          order.customer_id,
          { $inc: { loyalty_points: pointsToEarn } }
        );
        
        order.loyalty_points_earned = pointsToEarn;
      }
      
      const STATUS_LABELS = {
        PENDING: 'Chờ xử lý',
        CONFIRMED: 'Đã xác nhận',
        PROCESSING: 'Đang xử lý',
        SHIPPING: 'Đang giao',
        DELIVERED: 'Đã giao',
        CANCELLED: 'Đã hủy',
        REFUNDED: 'Đã hoàn tiền'
      };
      
      order.status = status;
      order.status_history.push({
        status,
        timestamp: new Date(),
        note: note || `Cập nhật trạng thái thành ${STATUS_LABELS[status]}`,
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
              shipping_method: 1,
              shipping_method_details: 1,
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