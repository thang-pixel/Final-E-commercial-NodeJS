const UserModel = require("../models/UserModel");

class UserController {
  // Lấy thông tin cá nhân
  async getMe(req, res) {
    try {
      const userId = req.user.id;
      
      const user = await UserModel.findById(userId).select('+addresses');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin người dùng'
        });
      }

      // Log để debug
      console.log('User data:', {
        id: user._id,
        name: user.full_name,
        phone: user.phone,
        addresses: user.addresses
      });
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting user info:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Cập nhật thông tin cá nhân
  async updateMe(req, res) {
    try {
      const userId = req.user.id;
      const { full_name, phone } = req.body;
      
      const updateData = {};
      if (full_name) updateData.full_name = full_name;
      if (phone) updateData.phone = phone;
      
      const user = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: user
      });
    } catch (error) {
      console.error('Error updating user info:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { old_password, new_password } = req.body;
      
      const user = await UserModel.findById(userId).select('+password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      const isMatch = await user.comparePassword(old_password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Mật khẩu cũ không đúng'
        });
      }
      
      user.password = new_password;
      await user.save();
      
      res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Thêm địa chỉ
  async addAddress(req, res) {
    try {
      const userId = req.user.id;
      const { address, ward, district, province, is_default = false } = req.body;
      
      if (!address || !ward || !district || !province) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng điền đầy đủ thông tin địa chỉ'
        });
      }
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      // Nếu đặt làm mặc định, bỏ mặc định của địa chỉ khác
      if (is_default) {
        user.addresses.forEach(addr => {
          addr.is_default = false;
        });
      }
      
      // Thêm địa chỉ mới
      user.addresses.push({
        address,
        ward,
        district,
        province,
        is_default
      });
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Thêm địa chỉ thành công',
        data: user
      });
    } catch (error) {
      console.error('Error adding address:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Sửa địa chỉ
  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.addressId;
      const { address, ward, district, province, is_default = false } = req.body;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
      
      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy địa chỉ'
        });
      }
      
      // Nếu đặt làm mặc định, bỏ mặc định của địa chỉ khác
      if (is_default) {
        user.addresses.forEach(addr => {
          addr.is_default = false;
        });
      }
      
      // Cập nhật địa chỉ
      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex]._doc,
        address,
        ward,
        district,
        province,
        is_default
      };
      
      await user.save();
      
      res.json({
        success: true,
        message: 'Cập nhật địa chỉ thành công',
        data: user
      });
    } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Xóa địa chỉ
  async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const addressId = req.params.addressId;
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === addressId);
      
      if (addressIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy địa chỉ'
        });
      }
      
      user.addresses.splice(addressIndex, 1);
      await user.save();
      
      res.json({
        success: true,
        message: 'Xóa địa chỉ thành công',
        data: user
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }



  // Admin: Lấy danh sách tất cả users
  async getAllUsers(req, res) {
    try {
      const users = await UserModel.find({})
        .select('full_name email phone role status createdAt')
        .sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Admin: Cập nhật user
  async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const { full_name, phone, role, status } = req.body;
      
      const updateData = {};
      if (full_name) updateData.full_name = full_name;
      if (phone) updateData.phone = phone;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      
      const user = await UserModel.findByIdAndUpdate(
        userId,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: user
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Admin: Ban user
  async banUser(req, res) {
    try {
      const userId = req.params.id;
      
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { status: 'inactive' },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.json({
        success: true,
        message: 'Đã khóa tài khoản người dùng',
        data: user
      });
    } catch (error) {
      console.error('Error banning user:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

  // Admin: Unban user
  async unbanUser(req, res) {
    try {
      const userId = req.params.id;
      
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { status: 'active' },
        { new: true }
      );
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      res.json({
        success: true,
        message: 'Đã mở khóa tài khoản người dùng',
        data: user
      });
    } catch (error) {
      console.error('Error unbanning user:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  }

}

module.exports = new UserController();