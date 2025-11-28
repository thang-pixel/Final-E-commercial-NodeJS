const UserModel = require("../models/UserModel");

class UserController {
  // Lấy thông tin cá nhân
  async getMe(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Cập nhật thông tin cá nhân
  async updateMe(req, res) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.user.id,
        req.body,
        { new: true }
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const { old_password, new_password } = req.body;
      const user = await UserModel.findById(req.user.id).select("+password");
      if (!user) return res.status(404).json({ message: "User not found" });
      const isMatch = await user.comparePassword(old_password);
      if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
      user.password = new_password;
      await user.save();
      res.json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Thêm địa chỉ
  async addAddress(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      user.addresses.push(req.body);
      await user.save();
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Sửa địa chỉ
  async updateAddress(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const addr = user.addresses.id(req.params.id);
      console.log("User addresses:", user.addresses);
      console.log("Param id:", req.params.id);
      if (!addr) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      Object.assign(addr, req.body);
      await user.save();
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Xóa địa chỉ
  async deleteAddress(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const addr = user.addresses.id(req.params.id);
      if (!addr) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });
      addr.remove();
      await user.save();
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }


  // Lấy danh sách tất cả user (admin)
  async getAll(req, res) {
    try {
      const users = await UserModel.find().select("-password");
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Cập nhật thông tin user bất kỳ (admin)
  async updateUser(req, res) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Ban (khóa) user
  async banUser(req, res) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { status: "inactive" },
        { new: true }
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User banned", user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  // Unban (mở khóa) user
  async unbanUser(req, res) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        req.params.id,
        { status: "active" },
        { new: true }
      );
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User unbanned", user });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new UserController();