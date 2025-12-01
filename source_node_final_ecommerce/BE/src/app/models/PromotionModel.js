const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const promotionSchema = new mongoose.Schema({
  _id: Number,
  
  // Thông tin cơ bản
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true,
    index: true
  },
  name: { type: String, required: true },
  description: String,
  
  // Loại giảm giá
  discount_type: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
    required: true
  },
  
  // Giá trị giảm giá
  discount_value: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Giá trị tối đa được giảm (cho loại PERCENTAGE)
  max_discount_amount: {
    type: Number,
    default: null
  },
  
  // Điều kiện áp dụng
  min_order_amount: {
    type: Number,
    default: 0
  },
  
  // Số lượng sử dụng
  usage_limit: {
    type: Number,
    default: null // null = unlimited
  },
  used_count: {
    type: Number,
    default: 0
  },
  
  // Thời gian hiệu lực
  start_date: {
    type: Date,
    required: true
  },
  end_date: {
    type: Date,
    required: true
  },
  
  // Trạng thái
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'EXPIRED'],
    default: 'ACTIVE'
  },
  
  // Áp dụng cho
  applicable_to: {
    type: String,
    enum: ['ALL', 'SPECIFIC_PRODUCTS', 'SPECIFIC_CATEGORIES'],
    default: 'ALL'
  },
  
  // Sản phẩm/danh mục được áp dụng
  applicable_products: [{ type: Number, ref: 'Product' }],
  applicable_categories: [{ type: Number, ref: 'Category' }],
  
  // Người tạo
  created_by: { type: Number, ref: 'User', required: true },
  
}, {
  timestamps: true,
  collection: "promotions"
});

// Plugin
promotionSchema.plugin(AutoIncrement, { id: "promotion_seq", inc_field: "_id" });
promotionSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

// Index
promotionSchema.index({ code: 1, status: 1 });
promotionSchema.index({ start_date: 1, end_date: 1 });
promotionSchema.index({ created_by: 1, createdAt: -1 });

// Virtual để check còn hiệu lực không
promotionSchema.virtual('is_valid').get(function() {
  const now = new Date();
  return this.status === 'ACTIVE' && 
         this.start_date <= now && 
         this.end_date >= now &&
         (this.usage_limit === null || this.used_count < this.usage_limit);
});

// Method để tính số tiền giảm
promotionSchema.methods.calculateDiscount = function(orderAmount) {
  if (!this.is_valid || orderAmount < this.min_order_amount) {
    return 0;
  }
  
  let discountAmount = 0;
  
  if (this.discount_type === 'PERCENTAGE') {
    discountAmount = orderAmount * (this.discount_value / 100);
    if (this.max_discount_amount && discountAmount > this.max_discount_amount) {
      discountAmount = this.max_discount_amount;
    }
  } else {
    discountAmount = this.discount_value;
  }
  
  return Math.min(discountAmount, orderAmount);
};

// Pre save middleware
promotionSchema.pre('save', function(next) {
  // Auto update status based on date
  const now = new Date();
  if (this.end_date < now) {
    this.status = 'EXPIRED';
  }
  next();
});

module.exports = mongoose.model("Promotion", promotionSchema);