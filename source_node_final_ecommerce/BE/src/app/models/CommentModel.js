const mongoose = require('mongoose');
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdater = require("mongoose-slug-updater");

const commentSchema = new mongoose.Schema(
  {
    _id: Number,
    product_id: { type: Number, ref: "Product", index: true },
    parent_id: { type: Number, ref: "Comment" },
    user_ref: { type: Number, default: 'GUEST' },
    content: { type: String },
    status: { type: String, enum: ["ACTIVE", "HIDDEN"], default: "ACTIVE" }, 
  },
  { _id: false, timestamps: true, collection: "comments" }
);

// --- Plugins ---
commentSchema.plugin(slugUpdater);
commentSchema.plugin(AutoIncrement, { id: "comment_seq", inc_field: "_id" });
commentSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

module.exports = mongoose.model("comment", commentSchema);
