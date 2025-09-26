const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: String,
    price: Number,
    qty: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    status: { type: String, enum: ['CREATED', 'CANCELLED'], default: 'CREATED' },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
