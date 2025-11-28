const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const slugUpdater = require("mongoose-slug-updater");
const AutoIncrement = require("mongoose-sequence")(mongoose);

mongoose.plugin(slugUpdater);

const brandSchema = new mongoose.Schema(
  {
    _id: Number,
    name: { type: String, required: true, unique: true },

    // gán brand chính cho 1 category (vd: "Điện thoại")
    // nếu muốn 1 brand dùng cho nhiều category -> có thể đổi thành [Number]
    category_id: {
      type: Number,
      ref: "Category",
      required: true,
      index: true,
    },

    description: { type: String, default: "" },
    image_url: { type: String, default: "" },

    slug: { type: String, slug: "name", unique: true, index: true },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { _id: false, timestamps: true, collection: "brands" }
);

// --- Plugins ---
brandSchema.plugin(AutoIncrement, { id: "brand_seq", inc_field: "_id" });
brandSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

module.exports = mongoose.model("Brand", brandSchema);


// const mongoose = require('mongoose');
// const mongooseDelete = require("mongoose-delete"); 
// const slugUpdater = require("mongoose-slug-updater");
// const AutoIncrement = require("mongoose-sequence")(mongoose);

// const brandSchema = new mongoose.Schema(
//   {
//     _id: Number,
//     name: { type: String, required: true, unique: true },
//     category_id: { type: Number, ref: "Category", required: true, index: true },
//     description: { type: String, default: ""},
//     image: { type: String, default: "" },
//     slug: { type: String, slug: "name", unique: true, index: true },
//     status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
//   },
//   { _id: false, timestamps: true, collection: "brands" }
// );

// // --- Plugins ---
// brandSchema.plugin(slugUpdater);
// brandSchema.plugin(AutoIncrement, { id: "brand_seq", inc_field: "_id" });
// brandSchema.plugin(mongooseDelete, {
//   deletedAt: true,
//   overrideMethods: "all",
//   validateBeforeDelete: false,
//   validateBeforeRestore: false,
// });
 
// module.exports = mongoose.model("Brand", brandSchema);
