const mongoose = require('mongoose');
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdater = require("mongoose-slug-updater");

const ratingSchema = new mongoose.Schema(
  {
    _id: Number,
    user_id: { type: Number, ref: "User", index: true, required: true },
    product_id: { type: Number, ref: "Product", index: true, required: true}, 
    content: { type: String, }, 
    rating: { type: Number, min: 1, max: 5, required: true },
  },
  { _id: false, timestamps: true, collection: "ratings" }
);

// --- Plugins ---
ratingSchema.plugin(slugUpdater);
ratingSchema.plugin(AutoIncrement, { id: "rating_seq", inc_field: "_id" });
ratingSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

const RatingModel = mongoose.model("rating", ratingSchema);
module.exports = RatingModel;