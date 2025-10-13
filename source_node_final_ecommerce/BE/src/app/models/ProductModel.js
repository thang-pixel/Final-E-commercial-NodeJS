const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdate = require("mongoose-slug-updater");
const { PRODUCT_STATUSES } = require("../../constants/dbEnum");

// Kích hoạt plugin slug
mongoose.plugin(slugUpdate);

/** Ảnh sản phẩm (thumbnail + hình mô tả) */
const productImageSchema = new Schema(
  {
    id: { type: Number }, // ID nội bộ trong sản phẩm
    type: { type: String, enum: ["THUMBNAIL", "IMAGES"], default: "IMAGES" },
    img_url: { type: String, required: true },
  },
  { _id: false }
);

/** Biến thể sản phẩm (variant: màu, dung lượng, giá, tồn kho) */
const productVariantSchema = new Schema(
  {
    id: { type: Number }, // ID nội bộ
    SKU: { type: String, required: true, unique: true, trim: true },
    color: { type: String, trim: true },
    storage: { type: String, trim: true },
    original_price: { type: Number, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "VND" },
    stock_quantity: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    _id: Number,
    brand_id: { type: Number, ref: "Brand", required: true, index: true },
    category_id: { type: Number, ref: "Category", required: true, index: true },
    name: { type: String, required: true, unique: true },
    slug: { type: String, slug: "name", unique: true, index: true },
    description: String,
    specifications: Schema.Types.Mixed, // ví dụ { ram: "8GB", cpu: "M2", ... }

    average_rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },

    images: [productImageSchema],
    variants: [productVariantSchema],

    min_price: { type: Number, default: 0 },
    max_price: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.INACTIVE],
      default: PRODUCT_STATUSES.ACTIVE,
      index: true,
    },
  },
  { timestamps: true, collection: "products" }
);

// --- Plugin tự tăng ID ---
productSchema.plugin(AutoIncrement, { id: "product_seq", inc_field: "_id" });

// --- Plugin xóa mềm ---
productSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

// --- Middleware: tự động sinh SKU & tính min/max price ---
productSchema.pre("save", function (next) {
  // Tính min/max giá
  if (this.variants && this.variants.length > 0) {
    const prices = this.variants.map((v) => v.price);
    this.min_price = Math.min(...prices);
    this.max_price = Math.max(...prices);

    //Tự động gán SKU nếu chưa có
    this.variants = this.variants.map((variant, idx) => {
      if (!variant.SKU) {
        const brandPart = this.brand_id ? `B${this.brand_id}` : "B0";
        const prodPart = this._id ? `P${this._id}` : "PX";
        const varPart = `V${idx + 1}`;
        variant.SKU = `${brandPart}-${prodPart}-${varPart}`;
      }
      variant.id = idx + 1; // Gán ID nội bộ
      return variant;
    });
  }
  if (this.images && this.images.length > 0) {
    // Gán ID nội bộ cho ảnh
    this.images = this.images.map((img, idx) => {
      img.id = idx + 1;
      return img;
    });
  }

  next();
});

module.exports = model("Product", productSchema);
