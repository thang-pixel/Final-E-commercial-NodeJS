const PaymentModel = require('../models/PaymentModel');
const OrderModel = require('../models/OrderModel');
const UserModel = require('../models/UserModel');
const VNPayService = require('../../services/VNPayService');
const { sendOrderConfirmationEmail } = require('../../utils/emailUtil');


class PaymentController {
  
  // [POST] /api/payment/vnpay/create
  async createVNPayPayment(req, res) {
    try {
      const { order_id, bank_code } = req.body;
      const customer_id = req.user.id;
      
      // Tìm đơn hàng
      const order = await OrderModel.findOne({
        _id: order_id,
        customer_id,
        status: 'PENDING'
      });
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy đơn hàng hoặc đơn hàng không thể thanh toán'
        });
      }
      
      // Kiểm tra xem đã có payment record chưa
      let payment = await PaymentModel.findOne({
        order_id,
        status: { $in: ['PENDING', 'PROCESSING'] }
      });
      
      // Tạo transaction ID unique với timestamp và random
      const currentTime = new Date();
      const vnCurrentTime = new Date(currentTime.getTime() + 7 * 60 * 60 * 1000); // VN timezone
      const uniqueId = `${order._id}_${vnCurrentTime.getTime()}_${Math.random().toString(36).substr(2, 5)}`;
      
      if (!payment) {
        // Tạo payment record mới
        payment = new PaymentModel({
          order_id,
          customer_id,
          payment_method: 'VNPAY',
          amount: order.total_amount,
          status: 'PENDING',
          expired_at: new Date(Date.now() + 30 * 60 * 1000), // Tăng lên 30 phút
          vnpay_transaction_id: uniqueId
        });
        
        await payment.save();
      } else {
        // Cập nhật transaction ID mới cho payment cũ
        payment.vnpay_transaction_id = uniqueId;
        payment.expired_at = new Date(Date.now() + 30 * 60 * 1000);
        payment.status = 'PROCESSING';
        await payment.save();
      }
      
      // Tạo URL thanh toán VNPay
      const orderInfo = `Thanh toan don hang ${order.order_number}`;
      const paymentUrl = VNPayService.createPaymentUrl(
        req,
        payment.vnpay_transaction_id,
        order.total_amount,
        orderInfo,
        bank_code
      );
      
      // Cập nhật payment
      payment.vnpay_order_info = orderInfo;
      payment.status_history.push({
        status: 'PROCESSING',
        note: 'Tạo link thanh toán VNPay thành công'
      });
      await payment.save();
      
      console.log('✅ VNPay payment created:', {
        payment_id: payment._id,
        vnpay_transaction_id: payment.vnpay_transaction_id,
        amount: order.total_amount,
        expired_at: payment.expired_at
      });
      
      res.json({
        success: true,
        message: 'Tạo link thanh toán thành công',
        data: {
          payment_url: paymentUrl,
          payment_id: payment._id,
          order_id: order._id,
          amount: order.total_amount,
          expired_at: payment.expired_at,
          vnpay_transaction_id: payment.vnpay_transaction_id // Debug info
        }
      });
      
    } catch (error) {
      console.error('Error creating VNPay payment:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi tạo thanh toán',
        error: error.message
      });
    }
  }
  
    // [GET] /api/payment/vnpay/return - VNPay callback 
  async handleVNPayReturn(req, res) {
    try {
      console.log('📥 VNPay return params:', req.query);
      
      const vnpParams = { ...req.query };
      const result = VNPayService.handleVNPayResponse(vnpParams);
      
      console.log('🔍 VNPay verification result:', result);
      
      if (!result.success) {
        console.error('❌ VNPay verification failed:', result.message);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=${encodeURIComponent(result.message)}`);
      }
      
      const { orderId, amount, transactionId, payDate, responseCode } = result.data;
      
      // Tìm payment record
      const payment = await PaymentModel.findOne({
        vnpay_transaction_id: orderId
      });
      
      if (!payment) {
        console.error('❌ Payment not found for transaction ID:', orderId);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=Payment+not+found`);
      }
      
      // Tìm order
      const order = await OrderModel.findById(payment.order_id);
      if (!order) {
        console.error('❌ Order not found for payment:', payment.order_id);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=Order+not+found`);
      }
      
      // Cập nhật payment
      payment.status = result.success ? 'SUCCESS' : 'FAILED';
      payment.vnpay_payment_id = transactionId;
      payment.vnpay_response_code = responseCode;
      payment.vnpay_secure_hash = req.query.vnp_SecureHash;
      payment.payment_date = new Date();
      
      payment.status_history.push({
        status: payment.status,
        note: result.message,
        vnpay_response: req.query
      });
      
      if (result.success) {
        console.log('✅ VNPay payment successful, updating order status');
        
        // Cập nhật trạng thái order
        order.status = 'CONFIRMED';
        order.status_history.push({
          status: 'CONFIRMED',
          note: 'Thanh toán VNPay thành công',
          timestamp: new Date()
        });
        
        // Cập nhật điểm tích lũy cho user
        const user = await UserModel.findById(order.customer_id);
        if (user) {
          user.loyalty_points = (user.loyalty_points || 0) + (order.loyalty_points_earned || 0);
          await user.save();
          console.log('✅ Updated user loyalty points');
          
          // GỬI EMAIL XÁC NHẬN THANH TOÁN THÀNH CÔNG - THÊM MỚI
          if (user.email) {
            console.log(`📧 Sending payment success email to ${user.email}...`);
            
            sendOrderConfirmationEmail(user.email, {
              ...order.toObject(),
              customer: user,
              paymentPending: false,
              paymentSuccess: true, // Flag để biết thanh toán đã thành công
              vnpayTransactionId: transactionId
            })
            .then(emailResult => {
              if (emailResult.success) {
                console.log(`✅ Payment success email sent to ${user.email}`);
              } else {
                console.log(`⚠️ Payment success email failed: ${emailResult.error}`);
              }
            })
            .catch(emailError => {
              console.error(`❌ Payment success email error: ${emailError.message}`);
            });
          }
        }
        
        await order.save();
        
        // Redirect về trang thành công
        return res.redirect(`${process.env.FRONTEND_URL}/payment/success?order_id=${order._id}`);
      } else {
        console.log('❌ VNPay payment failed');
        payment.failure_reason = result.message;
        
        // Redirect về trang thất bại
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?order_id=${order._id}&reason=${encodeURIComponent(result.message)}`);
      }
      
      await payment.save();
      
    } catch (error) {
      console.error('❌ Error handling VNPay return:', error);
      res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=Server+error`);
    }
  }
  
  // [POST] /api/payment/vnpay/ipn - VNPay IPN (webhook)
  async handleVNPayIPN(req, res) {
    try {
      const result = VNPayService.handleVNPayResponse(req.body);
      
      if (!result.success) {
        return res.json({ RspCode: '97', Message: 'Invalid signature' });
      }
      
      const { orderId } = result.data;
      
      const payment = await PaymentModel.findOne({
        vnpay_transaction_id: orderId
      });
      
      if (!payment) {
        return res.json({ RspCode: '01', Message: 'Order not found' });
      }
      
      if (payment.status !== 'PENDING' && payment.status !== 'PROCESSING') {
        return res.json({ RspCode: '02', Message: 'Order already confirmed' });
      }
      
      // Xử lý tương tự như return URL nhưng không redirect
      // ... (logic tương tự handleVNPayReturn)
      
      res.json({ RspCode: '00', Message: 'success' });
      
    } catch (error) {
      console.error('Error handling VNPay IPN:', error);
      res.json({ RspCode: '99', Message: 'Unknown error' });
    }
  }
  
  // [GET] /api/payment/:payment_id/status
  async getPaymentStatus(req, res) {
    try {
      const { payment_id } = req.params;
      const customer_id = req.user.id;
      
      const payment = await PaymentModel.findOne({
        _id: payment_id,
        customer_id
      }).populate('order_id');
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin thanh toán'
        });
      }
      
      res.json({
        success: true,
        data: payment
      });
      
    } catch (error) {
      console.error('Error getting payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
  
  // [POST] /api/payment/query/:order_id
  async queryPaymentStatus(req, res) {
    try {
      const { order_id } = req.params;
      const customer_id = req.user.id;
      
      const payment = await PaymentModel.findOne({
        order_id,
        customer_id,
        payment_method: 'VNPAY'
      });
      
      if (!payment || !payment.vnpay_transaction_id) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy giao dịch VNPay'
        });
      }
      
      // Query từ VNPay
      const transDate = payment.createdAt.toISOString().slice(0, 8).replace(/-/g, '');
      const result = await VNPayService.queryTransaction(payment.vnpay_transaction_id, transDate);
      
      if (result.success && result.data.responseCode === '00') {
        // Cập nhật payment nếu có thay đổi
        if (payment.status === 'PENDING' || payment.status === 'PROCESSING') {
          payment.status = 'SUCCESS';
          payment.payment_date = new Date();
          payment.status_history.push({
            status: 'SUCCESS',
            note: 'Query từ VNPay xác nhận thanh toán thành công'
          });
          await payment.save();
        }
      }
      
      res.json({
        success: true,
        data: {
          payment_status: payment.status,
          vnpay_result: result
        }
      });
      
    } catch (error) {
      console.error('Error querying payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController();