const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

class AuthController {
  // [POST] /auth/login
  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // Trả về user (ẩn password) và token
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ user: userObj, token });
  }

  async register(req, res) {
    try {
      const { email, full_name, password, phone, address } = req.body;
      // Kiểm tra email đã tồn tại chưa
      const exist = await User.findOne({ email });
      if (exist) return res.status(400).json({ message: "Email already exists" });

      // Tạo user mới
      const user = await User.create({
        email,
        full_name,
        password,
        phone,
        addresses: address ? [{ name: address, is_default: true }] : [],
        provider: "local"
      });

      // Tạo token
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      const userObj = user.toObject();
      delete userObj.password;
      res.json({ user: userObj, token });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}
}
module.exports = new AuthController();