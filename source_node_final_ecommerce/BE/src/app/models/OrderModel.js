const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const orderItemSchema = new mongoose.Schema({
  product_id: { type: Number, ref: "Product", required: true },
  variant_id: { type: Number, ref: "ProductVariant", required: true },
  SKU: { type: String, required: true },
  name: { type: String, required: true }, // snapshot tên sản phẩm
  attributes: [
    {
      code: { type: String, required: true },
      value: { type: String, required: true },
    }
  ],
  image_url: { type: String },
  price: { type: Number, required: true }, // giá tại thời điểm mua
  quantity: { type: Number, required: true, min: 1 },
  total_price: { type: Number, required: true }, // price * quantity
}, { _id: false });

const orderSchema = new mongoose.Schema({
  _id: Number,
  order_number: { type: String, unique: true, index: true }, // Mã đơn hàng duy nhất
  customer_id: { type: Number, ref: "User", required: true, index: true },
  
  // Thông tin sản phẩm
  items: [orderItemSchema],
  
  // Thông tin giá cả
  subtotal: { type: Number, required: true }, // tổng tiền hàng
  shipping_fee: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  discount_amount: { type: Number, default: 0 },
  loyalty_points_used: { type: Number, default: 0 }, // điểm tích lũy đã dùng
  total_amount: { type: Number, required: true }, // tổng cuối cùng
  
  // Thông tin giao hàng
  shipping_address: {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    ward: String,
    district: String,
    province: String,
    postal_code: String,
  },
  
  // Trạng thái đơn hàng
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPING", "DELIVERED", "CANCELLED", "REFUNDED"],
    default: "PENDING",
    index: true
  },
  
  // Lịch sử trạng thái
  status_history: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: String,
    updated_by: { type: Number, ref: "User" } // admin hoặc hệ thống
  }],
  
  // Thông tin thanh toán
  payment_method: {
    type: String,
    enum: ["COD", "BANK_TRANSFER", "CREDIT_CARD", "E_WALLET"],
    required: true
  },
  payment_status: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
    default: "PENDING"
  },
  payment_id: String, // ID từ payment gateway
  
  // Điểm tích lũy
  loyalty_points_earned: { type: Number, default: 0 }, // 10% total_amount
  
  // Ghi chú
  customer_note: String,
  admin_note: String,
  
}, {
  timestamps: true,
  collection: "orders"
});

// Plugin tự tăng ID
orderSchema.plugin(AutoIncrement, { id: "order_seq", inc_field: "_id" });

// Plugin xóa mềm
orderSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

// Middleware tạo order_number và tính loyalty points
orderSchema.pre("save", function(next) {
  // Tạo mã đơn hàng duy nhất
  if (!this.order_number) {
    const timestamp = Date.now().toString(36).toUpperCase();
    this.order_number = `ORD${timestamp}${this._id || ''}`;
  }
  
  // Tính điểm tích lũy (10% tổng tiền)
  if (this.total_amount && !this.loyalty_points_earned) {
    this.loyalty_points_earned = Math.floor(this.total_amount * 0.1);
  }
  
  // Thêm vào lịch sử trạng thái nếu trạng thái thay đổi
  if (this.isModified('status')) {
    this.status_history.push({
      status: this.status,
      timestamp: new Date(),
      note: `Trạng thái chuyển thành ${this.status}`
    });
  }
  
  next();
});

module.exports = mongoose.model("Order", orderSchema);