import { Schema, model } from "mongoose";
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const slugUpdater = require("mongoose-slug-updater");

const categorySchema = new Schema(
  {
    _id: Number,
    name: { type: String, unique: true },
    slug: { type: String, slug: "name", unique: true, index: true },
    description: String,
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

module.exports = model("Category", categorySchema);
