import { Schema, model } from "mongoose";
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdater = require("mongoose-slug-updater");

const reviewSchema = new Schema(
  {
    _id: Number,
    user_id: { type: Number, ref: "User",},
    product_id: { type: Number, ref: "Product", index: true},
    parent_id: { type: Number, ref: "Comment",},
    content: { type: String },
    status: { type: String, enum: ["active", "hidden"], default: "active" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false, timestamps: true, collection: "reviews" }
);

// --- Plugins ---
reviewSchema.plugin(slugUpdater);
reviewSchema.plugin(AutoIncrement, { id: "review_seq", inc_field: "_id" });
reviewSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

module.exports = model("Review", reviewSchema);
