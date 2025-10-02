import mongoose, { Schema } from "mongoose";
const mongooseDelete = require("mongoose-delete"); 
const slugUpdater = require("mongoose-slug-updater");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const brandSchema = new Schema(
  {
    _id: Number,
    name: String,
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
