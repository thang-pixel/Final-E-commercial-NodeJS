const mongoose = require('mongoose');
const mongooseDelete = require("mongoose-delete"); 
const slugUpdater = require("mongoose-slug-updater");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const brandSchema = new mongoose.Schema(
  {
    _id: Number,
    name: { type: String, required: true, unique: true },
    category_id: { type: Number, ref: "Category", required: true, index: true },
    description: { type: String, default: ""},
    image: { type: String, default: "" },
    slug: { type: String, slug: "name", unique: true, index: true }
  },
  { _id: false, timestamps: true, collection: "brands" }
);

// --- Plugins ---
brandSchema.plugin(slugUpdater);
brandSchema.plugin(AutoIncrement, { id: "brand_seq", inc_field: "_id" });
brandSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});
 
module.exports = mongoose.model("Brand", brandSchema);
