import mongoose, { Schema } from "mongoose";
import mongooseDelete from "mongoose-delete";
import AutoIncrement from "mongoose-sequence";

// Nếu bạn không có slugUpdater thì bỏ dòng này (để nguyên sẽ lỗi)
 // cartSchema.plugin(slugUpdater);  // ⛔ remove if not defined

// Nếu các collection khác dùng ObjectId, hãy đổi Number -> Schema.Types.ObjectId
const cartItemSchema = new Schema({
  product_id: { type: Number, ref: "Product", required: true },   // hoặc ObjectId
  variant_id: { type: Number, ref: "ProductVariant", required: true }, // nên có ref rõ ràng
  sku: { type: String },
  name: { type: String, required: true },       // snapshot tên tại thời điểm thêm
  thumbnail: { type: String },                  // snapshot ảnh
  attributes: {
    color: String,
    storage: String,
  },
  price: { type: Number, required: true, min: 0 },    // đơn giá (snapshot)
  quantity: { type: Number, required: true, min: 1, default: 1 },
}, { _id: false });

const cartSchema = new Schema({
  _id: Number,                                  // Auto increment
  customer_id: { type: Number, ref: "User", index: true, required: true },
  items: { type: [cartItemSchema], default: [] },
  quantity: { type: Number, default: 0 },       // tổng qty (denormalized)
  total_amount: { type: Number, default: 0 },   // tổng tiền (denormalized)
  status: { type: String, enum: ["active", "empty"], default: "active" },
}, {
  _id: false,
  timestamps: true,
  collection: "carts",
});

// Tự động tính lại quantity & total_amount trước khi save
cartSchema.methods.recalc = function () {
  const q = this.items.reduce((s, it) => s + (it.quantity || 0), 0);
  const total = this.items.reduce((s, it) => s + (it.quantity * it.price), 0);
  this.quantity = q;
  this.total_amount = total;
  this.status = q > 0 ? "active" : "empty";
};
cartSchema.pre("save", function (next) { this.recalc(); next(); });

// Index hữu ích (tăng tốc tìm theo user, tránh trùng variant)
cartSchema.index({ customer_id: 1 });
cartSchema.index({ customer_id: 1, "items.variant_id": 1 });

// Plugins
cartSchema.plugin(AutoIncrement(mongoose), { id: "cart_seq", inc_field: "_id" });
cartSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

export default mongoose.model("Cart", cartSchema);
