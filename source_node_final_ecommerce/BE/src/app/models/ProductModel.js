import mongoose, { Schema, model } from "mongoose";
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdate = require('mongoose-slug-updater');

/** Ảnh sản phẩm (không cần _id ObjectId) */
const productImageSchema = new Schema(
  {
    id:   { type: Number },          // ID số trong phạm vi 1 product
    type: { type: String, enum: ["thumbnail", "images"]},
    img_url: String
  },
  { _id: false }
);

/** Biến thể (màu/dung lượng/giá/stock) */
const productVariantSchema = new Schema(
  {
    id:   { type: Number },          // ID số trong phạm vi 1 product (variant_id)
    color: String,
    capacity: String,
    original_price: Number,
    stock_quantity: { type: Number, default: 0 }
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    _id: Number,
    brand_id:    { type: Number, ref: "Brand", index: true },
    category_id: { type: Number, ref: "Category", index: true },
    name: { type: String, unique: true },
    slug: { type: String, slug: "name", unique: true, index: true },
    description: String,
    average_rating: { type: Number, default: 0 },
    review_count:   { type: Number, default: 0 },

    images:   [productImageSchema],
    variants: [productVariantSchema],
 
  },
  { _id: false, timestamps: true, collection: "products" }
);
 

// --- Plugins ---
productSchema.plugin(slugUpdate);
productSchema.plugin(AutoIncrement, { id: "product_seq", inc_field: "_id" });
productSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});
 

module.exports =  model("Product", productSchema);
