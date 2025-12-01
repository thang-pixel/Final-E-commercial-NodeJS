const nodemailer = require('nodemailer');

// Tạo transporter (cấu hình email)
const createTransporter = () => {
  // Sử dụng Gmail hoặc service email khác
  return nodemailer.createTransporter({
    service: 'gmail', // hoặc 'smtp.gmail.com'
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', // Email của bạn
      pass: process.env.EMAIL_PASSWORD || 'your-app-password' // App password của Gmail
    }
  });
};

// Function gửi email xác nhận đơn hàng
const sendOrderConfirmationEmail = async (userEmail, order) => {
  try {
    const transporter = createTransporter();
    
    // Tạo nội dung email
    const emailContent = generateOrderEmailContent(order);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@eshop.com',
      to: userEmail,
      subject: `Xác nhận đơn hàng #${order.order_number} - E-Shop`,
      html: emailContent
    };
    
    const result = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function tạo nội dung HTML email
const generateOrderEmailContent = (order) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Xác nhận đơn hàng</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .order-info { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .product-list { border-collapse: collapse; width: 100%; margin: 20px 0; }
            .product-list th, .product-list td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            .product-list th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; color: #dc3545; }
            .footer { background-color: #f8f9fa; padding: 20px; text-align: center; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Đặt hàng thành công!</h1>
                <p>Cảm ơn bạn đã mua sắm tại E-Shop</p>
            </div>
            
            <div class="content">
                <h2>Thông tin đơn hàng</h2>
                <div class="order-info">
                    <p><strong>Mã đơn hàng:</strong> ${order.order_number}</p>
                    <p><strong>Ngày đặt:</strong> ${formatDate(order.createdAt)}</p>
                    <p><strong>Trạng thái:</strong> Đang xử lý</p>
                    <p><strong>Phương thức thanh toán:</strong> ${order.payment_method}</p>
                </div>

                <h3>Chi tiết sản phẩm</h3>
                <table class="product-list">
                    <thead>
                        <tr>
                            <th>Sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>
                                    <strong>${item.name}</strong><br>
                                    <small>SKU: ${item.SKU}</small><br>
                                    <small>${item.attributes?.map(attr => `${attr.code}: ${attr.value}`).join(', ') || ''}</small>
                                </td>
                                <td>${item.quantity}</td>
                                <td>${formatPrice(item.price)}</td>
                                <td>${formatPrice(item.total_price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin: 20px 0;">
                    <p><strong>Tạm tính:</strong> ${formatPrice(order.subtotal)}</p>
                    <p><strong>Phí vận chuyển:</strong> ${order.shipping_fee === 0 ? 'Miễn phí' : formatPrice(order.shipping_fee)}</p>
                    ${order.discount_amount > 0 ? `<p><strong>Giảm giá:</strong> -${formatPrice(order.discount_amount)}</p>` : ''}
                    <hr>
                    <p class="total">Tổng cộng: ${formatPrice(order.total_amount)}</p>
                </div>

                <h3>Địa chỉ giao hàng</h3>
                <div class="order-info">
                    <p><strong>${order.shipping_address.full_name}</strong></p>
                    <p>📞 ${order.shipping_address.phone}</p>
                    <p>📍 ${order.shipping_address.address}</p>
                    <p>${[
                      order.shipping_address.ward,
                      order.shipping_address.district, 
                      order.shipping_address.province
                    ].filter(Boolean).join(', ')}</p>
                </div>

                ${order.loyalty_points_earned > 0 ? `
                <div class="order-info" style="background-color: #d4edda; border-color: #c3e6cb;">
                    <p><strong>🎁 Điểm tích lũy:</strong></p>
                    <p>Bạn đã nhận được <strong>${order.loyalty_points_earned.toLocaleString()} điểm</strong> từ đơn hàng này!</p>
                    <p><small>Điểm có thể sử dụng cho đơn hàng tiếp theo.</small></p>
                </div>
                ` : ''}

                ${order.customer_note ? `
                <h3>Ghi chú đơn hàng</h3>
                <div class="order-info">
                    <p>${order.customer_note}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p><strong>E-Shop</strong></p>
                <p>📧 support@eshop.com | 📞 1900-xxxx</p>
                <p><small>Đây là email tự động, vui lòng không reply.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Function gửi email reset password (để mở rộng sau)
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@eshop.com',
      to: userEmail,
      subject: 'Đặt lại mật khẩu - E-Shop',
      html: `
        <h2>Yêu cầu đặt lại mật khẩu</h2>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản E-Shop.</p>
        <p>Nhấn vào link bên dưới để đặt lại mật khẩu:</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}" 
           style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
           Đặt lại mật khẩu
        </a>
        <p><small>Link này sẽ hết hạn sau 1 giờ.</small></p>
        <p><small>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</small></p>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: result.messageId
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendPasswordResetEmail
};