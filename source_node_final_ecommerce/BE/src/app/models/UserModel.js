const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");

const addressSubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    is_default: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    _id: { type: Number }, // auto-increment
    full_name: { type: String, required: true, trim: true },

    username: { type: String, unique: true, sparse: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: { validator: isEmail, message: "Invalid email address" },
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true, 
      // validate: {
      //   validator: (v) => /^(\+?84|0)([3|5|7|8|9])\d{8}$/.test(v),
      //   message: "Invalid phone number",
      // },
    },

    password: { type: String, select: false }, // ẩn khi query bình thường

    role: {
      type: String,
      enum: ["admin", "customer", "staff"],
      default: "customer",
      index: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    provider: {
      type: String,
      enum: ["local", "google", "facebook"],
      default: "local",
    },
    providerId: { type: String },

    point: { type: Number, default: 0 },

    addresses: [addressSubSchema],

    avatar: { type: String, maxLength: 255, default: "" },
  },
  {
    _id: false,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// --- Plugins ---
userSchema.plugin(AutoIncrement, { id: "user_seq", inc_field: "_id" });
userSchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
  validateBeforeDelete: false,
  validateBeforeRestore: false,
});
 

// --- Hash password khi tạo / cập nhật ---
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Hash khi dùng findOneAndUpdate({ password: ... })
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() || {};
  const pwd = update.password || (update.$set && update.$set.password);
  if (pwd) {
    const hashed = await bcrypt.hash(pwd, 10);
    if (update.password) update.password = hashed;
    if (update.$set && update.$set.password) update.$set.password = hashed;
    this.setUpdate(update);
  }
  next();
});

// --- Helper method so sánh mật khẩu ---
userSchema.methods.comparePassword = function (plain) {
  // vì password select:false, cần .select('+password') khi gọi
  return bcrypt.compare(plain, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
