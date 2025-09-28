const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
