const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const paymentSchema = new mongoose.Schema({
  _id: Number,
  
  // Liên kết với đơn hàng
  order_id: { type: Number, ref: "Order", required: true, index: true },
  customer_id: { type: Number, ref: "User", required: true, index: true },
  
  // Thông tin thanh toán
  payment_method: {
    type: String,
    enum: ["COD", "VNPAY", "BANK_TRANSFER", "CREDIT_CARD", "E_WALLET"],
    required: true
  },
  
  // Thông tin VNPay
  vnpay_transaction_id: { type: String, index: true, unique: true, sparse: true }, // Fix: thêm sparse
  vnpay_payment_id: { type: String, index: true },
  vnpay_order_info: String,
  vnpay_response_code: String,
  vnpay_transaction_status: String,
  vnpay_secure_hash: String,
  
  // Số tiền
  amount: { type: Number, required: true },
  currency: { type: String, default: "VND" },
  
  // Trạng thái thanh toán
  status: {
    type: String,
    enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"],
    default: "PENDING",
    index: true
  },
  
  // Thời gian
  payment_date: Date,
  expired_at: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 phút thay vì 15
  },
  
  // Ghi chú
  note: String,
  failure_reason: String,
  
  // Lịch sử trạng thái
  status_history: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: String,
    vnpay_response: Object
  }],
  
  // Thông tin callback/webhook
  callback_url: String,
  return_url: String,
  
}, {
  timestamps: true,
  collection: "payments"
});

// Plugin tự tăng ID
paymentSchema.plugin(AutoIncrement, { id: "payment_seq", inc_field: "_id" });

// Plugin xóa mềm
paymentSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

// Index cho tìm kiếm - Fixed
paymentSchema.index({ vnpay_transaction_id: 1 }, { unique: true, sparse: true });
paymentSchema.index({ order_id: 1, status: 1 });
paymentSchema.index({ customer_id: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);