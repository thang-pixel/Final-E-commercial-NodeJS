const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdater = require("mongoose-slug-updater");
const { CATEGORY_STATUSES } = require("../../constants/dbEnum");

const categorySchema = new mongoose.Schema(
  {
    _id: Number,
    name: { type: String, unique: true },
    slug: { type: String, slug: "name", unique: true, index: true },
    parent_id: { type: Number, ref: "Category", default: null },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    status: { type: String, enum: [CATEGORY_STATUSES.ACTIVE, CATEGORY_STATUSES.INACTIVE], default: CATEGORY_STATUSES.ACTIVE }
  },
  { _id: false, timestamps: true, collection: "categories" }
);

// --- Plugins ---
categorySchema.plugin(slugUpdater);
categorySchema.plugin(AutoIncrement, { id: "category_seq", inc_field: "_id" });
categorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

module.exports = mongoose.model("Category", categorySchema);
