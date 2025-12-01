const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const slugUpdater = require("mongoose-slug-updater");
const AutoIncrement = require("mongoose-sequence")(mongoose);

mongoose.plugin(slugUpdater);

const notificationSchema = new mongoose.Schema(
  {
    _id: Number,
    user_id: { type: Number, ref: "User", index: true, required: true },
    type: { type: String, required: true }, // INFO, ORDER, PROMOTION, COMMENT, USER, SHIPPING, PRODUCT
    title: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false },
  },
  {
    _id: false,
    timestamps: true,
    collection: "notifications",
  }
);


// --- Plugins ---
notificationSchema.plugin(AutoIncrement, { id: "notification_seq", inc_field: "_id" });
notificationSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

module.exports = mongoose.model("Notification", notificationSchema);