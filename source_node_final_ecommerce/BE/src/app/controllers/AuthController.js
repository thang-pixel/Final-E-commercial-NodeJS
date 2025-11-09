const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const fetch = require('node-fetch');

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
  // [POST] /auth/social
  async socialLogin(req, res) {
    try {
      const { provider, token } = req.body;
      let profile = null;

      if (provider === "google") {
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        profile = {
          email: payload.email,
          full_name: payload.name,
          providerId: payload.sub,
          avatar: payload.picture || "",
        };
      } else if (provider === "facebook") {
        // token = facebook access token
        const fbRes = await fetch(
          `https://graph.facebook.com/me?access_token=${token}&fields=id,name,email,picture`
        );
        const fbData = await fbRes.json();
        profile = {
          email: fbData.email,
          full_name: fbData.name,
          providerId: fbData.id,
          avatar: fbData.picture?.data?.url || "",
        };
      } else {
        return res.status(400).json({ message: "Unsupported provider" });
      }

      // find by providerId or by email
      let user = await User.findOne({
        $or: [
          { provider: provider, providerId: profile.providerId },
          { email: profile.email },
        ],
      });

      if (!user) {
        // create user (ensure unique phone/email by using timestamp suffix)
        user = await User.create({
          email: profile.email || `guest_${Date.now()}@guest.local`,
          full_name: profile.full_name || "User",
          provider: provider,
          providerId: profile.providerId,
          avatar: profile.avatar || "",
          phone: `0000000000` // phone required in schema -> use unique placeholder
        });
      } else {
        // update provider info if needed
        let changed = false;
        if (!user.providerId && profile.providerId) {
          user.providerId = profile.providerId;
          changed = true;
        }
        if (user.provider !== provider) {
          user.provider = provider;
          changed = true;
        }
        if (changed) await user.save();
      }

      const tokenJWT = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      const userObj = user.toObject();
      delete userObj.password;
      res.json({ user: userObj, token: tokenJWT });
    } catch (err) {
      console.error("socialLogin error", err);
      res.status(500).json({ message: err.message });
    }
  }

  // [POST] /auth/guest
  async guestLogin(req, res) {
    try {
      const unique = Date.now();
      const email = `guest_${unique}@guest.local`;
      const phone = `guest${unique}`;
      const password = Math.random().toString(36).slice(-8);

      const user = await User.create({
        email,
        full_name: "Guest",
        password,
        phone,
        provider: "local",
        role: "customer",
      });

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      const userObj = user.toObject();
      delete userObj.password;
      res.json({ user: userObj, token });
    } catch (err) {
      console.error("guestLogin error", err);
      res.status(500).json({ message: err.message });
    }
  }
}
module.exports = new AuthController();