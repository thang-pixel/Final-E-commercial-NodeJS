const nodemailer = require('nodemailer');

// Tạo transporter (cấu hình email)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  });
};

// Function gửi email xác nhận đơn hàng - UPDATED
const sendOrderConfirmationEmail = async (userEmail, orderData) => {
  try {
    const transporter = createTransporter();
    
    // Tạo nội dung email dựa vào trạng thái
    const emailContent = generateOrderEmailContent(orderData);
    
    // Tạo subject dựa vào trạng thái
    let subject = `Xác nhận đơn hàng #${orderData.order_number} - E-Shop`;
    
    if (orderData.paymentPending) {
      subject = `Đơn hàng #${orderData.order_number} đang chờ thanh toán - E-Shop`;
    } else if (orderData.paymentSuccess) {
      subject = `Thanh toán thành công - Đơn hàng #${orderData.order_number} - E-Shop`;
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@eshop.com',
      to: userEmail,
      subject: subject,
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

// Function tạo nội dung HTML email - UPDATED
const generateOrderEmailContent = (orderData) => {
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

  // Xác định tiêu đề và thông báo dựa vào trạng thái
  let headerTitle = '🎉 Đặt hàng thành công!';
  let headerMessage = 'Cảm ơn bạn đã mua sắm tại E-Shop';
  let statusText = 'Đang xử lý';
  let statusColor = '#ffc107'; // warning color
  
  if (orderData.paymentPending) {
    headerTitle = '⏳ Đơn hàng đang chờ thanh toán';
    headerMessage = 'Vui lòng hoàn tất thanh toán để xác nhận đơn hàng';
    statusText = 'Chờ thanh toán';
    statusColor = '#fd7e14'; // orange
  } else if (orderData.paymentSuccess) {
    headerTitle = '✅ Thanh toán thành công!';
    headerMessage = 'Đơn hàng của bạn đã được xác nhận và đang được xử lý';
    statusText = 'Đã thanh toán';
    statusColor = '#28a745'; // success color
  }

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
            .status-badge { 
              display: inline-block; 
              padding: 5px 10px; 
              border-radius: 15px; 
              color: white; 
              font-weight: bold; 
              background-color: ${statusColor};
            }
            .payment-info { background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .promotion-info { background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border: 1px solid #c3e6cb; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${headerTitle}</h1>
                <p>${headerMessage}</p>
            </div>
            
            <div class="content">
                <h2>Thông tin đơn hàng</h2>
                <div class="order-info">
                    <p><strong>Mã đơn hàng:</strong> ${orderData.order_number}</p>
                    <p><strong>Ngày đặt:</strong> ${formatDate(orderData.createdAt)}</p>
                    <p><strong>Trạng thái:</strong> <span class="status-badge">${statusText}</span></p>
                    <p><strong>Phương thức thanh toán:</strong> ${orderData.payment_method}</p>
                    ${orderData.vnpayTransactionId ? `<p><strong>Mã giao dịch VNPay:</strong> ${orderData.vnpayTransactionId}</p>` : ''}
                </div>

                ${orderData.paymentPending ? `
                <div class="payment-info">
                    <h3>🔔 Lưu ý quan trọng</h3>
                    <p>• Đơn hàng của bạn sẽ được xác nhận sau khi thanh toán thành công</p>
                    <p>• Thời gian thanh toán tối đa: 30 phút kể từ khi tạo đơn</p>
                    <p>• Nếu không thanh toán trong thời gian quy định, đơn hàng sẽ tự động hủy</p>
                </div>
                ` : ''}

                ${orderData.paymentSuccess ? `
                <div class="payment-info">
                    <h3>✅ Thanh toán thành công</h3>
                    <p>• Chúng tôi đã nhận được thanh toán của bạn</p>
                    <p>• Đơn hàng sẽ được chuẩn bị và giao trong thời gian sớm nhất</p>
                    <p>• Bạn sẽ nhận được email cập nhật trạng thái giao hàng</p>
                </div>
                ` : ''}

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
                        ${orderData.items.map(item => `
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
                    <p><strong>Tạm tính:</strong> ${formatPrice(orderData.subtotal)}</p>
                    <p><strong>Phí vận chuyển:</strong> ${orderData.shipping_fee === 0 ? 'Miễn phí' : formatPrice(orderData.shipping_fee)}</p>
                    
                    ${orderData.promotion_used ? `
                    <div class="promotion-info">
                        <p><strong>🎟️ Mã giảm giá đã sử dụng:</strong></p>
                        <p><strong>${orderData.promotion_used.code}</strong> - ${orderData.promotion_used.name}</p>
                        <p>Giảm: <strong style="color: #28a745;">-${formatPrice(orderData.promotion_used.discount_amount)}</strong></p>
                    </div>
                    ` : ''}
                    
                    ${orderData.loyalty_points_used > 0 ? `<p><strong>Điểm tích lũy sử dụng:</strong> -${formatPrice(orderData.loyalty_points_used)}</p>` : ''}
                    ${orderData.discount_amount > 0 ? `<p><strong>Tổng giảm giá:</strong> -${formatPrice(orderData.discount_amount)}</p>` : ''}
                    <hr>
                    <p class="total">Tổng cộng: ${formatPrice(orderData.total_amount)}</p>
                </div>

                <h3>Địa chỉ giao hàng</h3>
                <div class="order-info">
                    <p><strong>${orderData.shipping_address.full_name}</strong></p>
                    <p>📞 ${orderData.shipping_address.phone}</p>
                    <p>📍 ${orderData.shipping_address.address}</p>
                    <p>${[
                      orderData.shipping_address.ward,
                      orderData.shipping_address.district, 
                      orderData.shipping_address.province
                    ].filter(Boolean).join(', ')}</p>
                </div>

                ${orderData.loyalty_points_earned > 0 ? `
                <div class="order-info" style="background-color: #d4edda; border: 1px solid #c3e6cb;">
                    <p><strong>🎁 Điểm tích lũy:</strong></p>
                    <p>Bạn sẽ nhận được <strong>${orderData.loyalty_points_earned.toLocaleString()} điểm</strong> sau khi đơn hàng hoàn thành!</p>
                    <p><small>Điểm có thể sử dụng cho đơn hàng tiếp theo.</small></p>
                </div>
                ` : ''}

                ${orderData.customer_note ? `
                <h3>Ghi chú đơn hàng</h3>
                <div class="order-info">
                    <p>${orderData.customer_note}</p>
                </div>
                ` : ''}

                ${orderData.customer ? `
                <div class="order-info">
                    <h3>Thông tin khách hàng</h3>
                    <p><strong>Tên:</strong> ${orderData.customer.full_name}</p>
                    <p><strong>Email:</strong> ${orderData.customer.email}</p>
                    <p><strong>Điểm tích lũy hiện tại:</strong> ${(orderData.customer.loyalty_points || 0).toLocaleString()} điểm</p>
                </div>
                ` : ''}
            </div>
            
            <div class="footer">
                <p><strong>E-Shop - Hệ thống thương mại điện tử</strong></p>
                <p>📧 ${process.env.EMAIL_USER || 'support@eshop.com'} | 📞 1900-xxxx</p>
                <p><strong>Website:</strong> ${process.env.FRONTEND_URL || 'http://localhost:3000'}</p>
                <p><small>Đây là email tự động, vui lòng không reply trực tiếp.</small></p>
                <p><small>Nếu cần hỗ trợ, vui lòng liên hệ qua số hotline hoặc email support.</small></p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Function gửi email reset password
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@eshop.com',
      to: userEmail,
      subject: 'Đặt lại mật khẩu - E-Shop',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h2>🔐 Đặt lại mật khẩu</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản E-Shop.</p>
            <p>Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p><strong>⚠️ Lưu ý quan trọng:</strong></p>
              <p>• Link này sẽ hết hạn sau <strong>1 giờ</strong></p>
              <p>• Chỉ sử dụng được <strong>1 lần</strong></p>
              <p>• Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</p>
            </div>
            
            <p><small>Nếu nút không hoạt động, copy và paste link sau vào trình duyệt:</small></p>
            <p><small>${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}</small></p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <p><strong>E-Shop Support Team</strong></p>
            <p>📧 ${process.env.EMAIL_USER || 'support@eshop.com'}</p>
          </div>
        </div>
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