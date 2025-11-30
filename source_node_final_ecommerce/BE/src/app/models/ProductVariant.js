const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const productVariantSchema = new mongoose.Schema(
  {
    _id: Number,
    product_id: {
      type: Number,
      ref: "Product",
      required: true,
      index: true,
    },

    SKU: { type: String, unique: true, trim: true, index: true },

    // giá bán & tồn kho
    original_price: { type: Number, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },

    image: { type: String, default: "" },

    // thuộc tính cụ thể của biến thể (tùy category)
    // ví dụ:
    //  - ĐT: { code: 'color', value: 'Black' }, { code: 'storage', value: '128GB' }
    //  - Áo: { code: 'color', value: 'Red' }, { code: 'size', value: 'M' }
    attributes: [
      {
        code: { type: String, required: true },  // phải trùng code trong Category.attributes
        value: { type: String, required: true },
        extra: { type: String },                // vd: mã màu #ff0000
      },
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true, collection: "product_variants" }
);

productVariantSchema.plugin(AutoIncrement, {
  id: "product_variant_seq",
  inc_field: "_id",
  disable_hooks: false, // Bật hooks cho insertMany
});
 

productVariantSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

// pre tạo SKU
// productVariantSchema.pre("save", function (next) {
//   if (!this.SKU) {
//     const attr = this.attributes.map(a => `${a.code}-${a.value}`).join("-");
//     this.SKU = `P${this.product_id}-V${this._id}-${attr}`;
//   }
//   next();
// });

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
module.exports = ProductVariant;