import mongoose, { Schema, model } from "mongoose";
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose); 

const cartSchema = Schema(
    {
        _id: Number,
        customer_id: { type: Number, ref: "User", index: true},
        quantity: { type: Number, default: 0 },
        total_amount: { type: Number, default: 0 },
        status: { type: String, enum: ["active", "empty"], default: "active" },
    }, 
    {
        _id: false,
        timestamps: true,
        collection: "carts"
    }
);


// --- Plugins ---
cartSchema.plugin(slugUpdater);
cartSchema.plugin(AutoIncrement, { id: "cart_seq", inc_field: "_id" });
cartSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});

module.exports = mongoose.model("Cart", cartSchema);