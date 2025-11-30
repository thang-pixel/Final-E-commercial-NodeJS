const crypto = require('crypto');
const moment = require('moment-timezone');


class VNPayService {
  constructor() {
    this.vnpUrl = process.env.VNPAY_API_URL;
    this.vnpTmnCode = process.env.VNPAY_TMN_CODE;
    this.vnpHashSecret = process.env.VNPAY_HASH_SECRET;
    this.vnpReturnUrl = process.env.VNPAY_RETURN_URL;
  }

  createPaymentUrl(req, orderId, amount, orderInfo, bankCode = '') {
    process.env.TZ = 'Asia/Ho_Chi_Minh';
    
    // 1. Xử lý IP: Hardcode 127.0.0.1 để tránh lỗi format IPv6 của Docker
    // VNPay Sandbox không chặn IP này.
    const ipAddr = '127.0.0.1';

    // 2. Thời gian
    const createDate = moment().tz('Asia/Ho_Chi_Minh').format('YYYYMMDDHHmmss');
    const expireDate = moment().tz('Asia/Ho_Chi_Minh').add(15, 'minutes').format('YYYYMMDDHHmmss');

    // 3. Tạo tham số
    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnpTmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId.toString();
    vnp_Params['vnp_OrderInfo'] = orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = this.vnpReturnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;

    if (bankCode && bankCode !== '') {
        vnp_Params['vnp_BankCode'] = bankCode;
    }

    // 4. Sắp xếp tham số (Alphabet)
    vnp_Params = this.sortObject(vnp_Params);

    // 5. TỰ TẠO CHUỖI MÃ HÓA (MANUAL ENCODING)

    let signData = [];
    let query = [];

    Object.keys(vnp_Params).forEach((key) => {
        let value = vnp_Params[key];
        
        // Kiểm tra data rỗng
        if (value !== null && value !== "" && value !== undefined) {

            let encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
            

            signData.push(key + "=" + encodedValue);
            query.push(key + "=" + encodedValue);
        }
    });

    // Nối các tham số bằng dấu &
    let signDataStr = signData.join("&");
    let queryStr = query.join("&");

    console.log('🔐 Raw Sign Data:', signDataStr);
    
    // 6. Tạo Hash
    const hmac = crypto.createHmac("sha512", this.vnpHashSecret);
    const signed = hmac.update(Buffer.from(signDataStr, 'utf-8')).digest("hex");
    
    // 7. Tạo URL cuối cùng
    const finalUrl = this.vnpUrl + '?' + queryStr + '&vnp_SecureHash=' + signed;

    console.log('🔗 Generated URL:', finalUrl);
    
    return finalUrl;
  }

  // Sắp xếp object
  sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = obj[str[key]];
    }
    return sorted;
  }

  // Xác thực callback
  verifyCallback(vnp_Params) {
    let secureHash = vnp_Params['vnp_SecureHash'];
    
    let vnp_Params_Clone = { ...vnp_Params };
    delete vnp_Params_Clone['vnp_SecureHash'];
    delete vnp_Params_Clone['vnp_SecureHashType'];

    vnp_Params_Clone = this.sortObject(vnp_Params_Clone);

    let signData = [];
    Object.keys(vnp_Params_Clone).forEach((key) => {
        let value = vnp_Params_Clone[key];
        if (value !== null && value !== "" && value !== undefined) {
             // Logic encode tương tự lúc tạo
             let encodedValue = encodeURIComponent(value).replace(/%20/g, "+");
             signData.push(key + "=" + encodedValue);
        }
    });

    let signDataStr = signData.join("&");
    
    const hmac = crypto.createHmac("sha512", this.vnpHashSecret);
    const signed = hmac.update(Buffer.from(signDataStr, 'utf-8')).digest("hex");     
    
    return secureHash === signed;
  }

  // Xử lý response
  handleVNPayResponse(vnpParams) {
    const isValid = this.verifyCallback(vnpParams);
    if (!isValid) {
      return {
        success: false,
        message: 'Chữ ký không hợp lệ (Invalid Signature)',
        data: null
      };
    }

    const responseCode = vnpParams['vnp_ResponseCode'];
    return {
      success: responseCode === '00',
      message: this.getResponseMessage(responseCode),
      data: {
        orderId: vnpParams['vnp_TxnRef'],
        amount: parseInt(vnpParams['vnp_Amount']) / 100,
        transactionId: vnpParams['vnp_TransactionNo'],
        payDate: vnpParams['vnp_PayDate'],
        responseCode: responseCode
      }
    };
  }

  getResponseMessage(responseCode) {
    const messages = {
      '00': 'Giao dịch thành công',
      '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
      '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
      '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
      '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
      '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
      '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
      '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
      '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
      '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
      '75': 'Ngân hàng thanh toán đang bảo trì.',
      '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
      '97': 'Sai chữ ký - Invalid signature',
      '99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
    };
    return messages[responseCode] || 'Lỗi ' + responseCode;
  }
}

module.exports = new VNPayService();