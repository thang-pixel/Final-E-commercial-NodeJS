const mongoose = require('mongoose');
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdater = require("mongoose-slug-updater");

const reviewSchema = new mongoose.Schema(
  {
    _id: Number,
    user_id: { type: Number, ref: "User",},
    product_id: { type: Number, ref: "Product", index: true}, 
    content: { type: String }, 
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

module.exports = mongoose.model("Review", reviewSchema);
