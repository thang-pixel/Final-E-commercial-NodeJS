const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const fetch = require('node-fetch');
const { sendWelcomeEmail } = require('../../utils/emailUtil');
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
      const { 
        email, 
        full_name, 
        phone, 
        address, 
        ward, 
        district, 
        province 
      } = req.body;

      // Validate required fields
      if (!email || !full_name || !phone || !address || !ward || !district || !province) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin đăng ký'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Định dạng email không hợp lệ'
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [
          { email: email },
          { phone: phone }
        ]
      });

      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Số điện thoại';
        return res.status(400).json({
          success: false,
          message: `${field} đã được sử dụng`
        });
      }

      // Generate random password (10 characters)
      const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
        let password = '';
        for (let i = 0; i < 10; i++) {
          password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
      };

      const randomPassword = generateRandomPassword();
      console.log(`🔑 Generated password for ${email}:`, randomPassword);

      // THÊM MỚI: Function để tạo user với retry mechanism
      const createUserWithRetry = async (userData, maxRetries = 3) => {
        for (let i = 0; i < maxRetries; i++) {
          try {
            return await User.create(userData);
          } catch (error) {
            if (error.code === 11000 && error.keyPattern._id && i < maxRetries - 1) {
              console.log(`⚠️ Duplicate ID detected, retrying... (${i + 1}/${maxRetries})`);
              
              // Reset sequence và thử lại
              const lastUser = await User.findOne({}, {}, { sort: { '_id': -1 } });
              const nextId = lastUser ? lastUser._id + 1 : 1;
              
              await mongoose.connection.db.collection('counters').findOneAndUpdate(
                { _id: 'user_seq' },
                { $set: { seq: nextId - 1 } },
                { upsert: true }
              );
              
              continue; // Try again
            }
            throw error; // Re-throw if not ID duplicate or max retries reached
          }
        }
      };

      // Create user with retry
      const newUser = await createUserWithRetry({
        email,
        full_name,
        phone,
        password: randomPassword,
        provider: 'local',
        role: 'customer',
        status: 'active',
        loyalty_points: 0,
        addresses: [{
          address,
          ward,
          district,
          province,
          is_default: true
        }]
      });

      console.log('✅ User created successfully:', {
        id: newUser._id,
        email: newUser.email,
        name: newUser.full_name
      });

      // Send welcome email with password
      try {
        console.log('📧 Sending welcome email...');
        const emailResult = await sendWelcomeEmail(email, {
          full_name,
          email,
          password: randomPassword,
          login_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
        });

        if (emailResult.success) {
          console.log('✅ Welcome email sent successfully');
        } else {
          console.error('❌ Failed to send welcome email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Welcome email error:', emailError);
        // Không throw error vì user đã được tạo thành công
      }

      // Generate JWT token for auto-login
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, role: newUser.role },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );

      // Return user data (hide password)
      const userObj = newUser.toObject();
      delete userObj.password;

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để nhận mật khẩu.',
        user: userObj,
        token
      });

    } catch (error) {
      console.error('❌ Register error:', error);
      
      // Handle duplicate key errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        const fieldName = field === 'email' ? 'Email' : 'Số điện thoại';
        return res.status(400).json({
          success: false,
          message: `${fieldName} đã được sử dụng`
        });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: errorMessages[0] || 'Dữ liệu không hợp lệ'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Lỗi server, vui lòng thử lại sau'
      });
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
          phone: `${Date.now()}` // phone required in schema -> use unique placeholder
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