const mongoose = require('mongoose');

class SequentialIdHelper {
  // Tạo sequential ID cho User
  static async getNextUserId() {
    try {
      // Sử dụng atomic findOneAndUpdate để đảm bảo thread-safe
      const counter = await mongoose.connection.db.collection('counters').findOneAndUpdate(
        { _id: 'user_seq' },
        { $inc: { seq: 1 } },
        { 
          upsert: true, 
          returnDocument: 'after' // Trả về document sau khi update
        }
      );
      
      return counter.seq || 1;
    } catch (error) {
      console.error('Error getting next user ID:', error);
      
      // Fallback: tìm max _id hiện tại + 1
      const UserModel = require('../app/models/UserModel');
      const maxUser = await UserModel.findOne({}, {}, { sort: { '_id': -1 } });
      const nextId = maxUser ? (parseInt(maxUser._id) + 1) : 1;
      
      // Update counter
      await mongoose.connection.db.collection('counters').updateOne(
        { _id: 'user_seq' },
        { $set: { seq: nextId } },
        { upsert: true }
      );
      
      return nextId;
    }
  }

  // Tạo sequential ID cho Order
  static async getNextOrderId() {
    try {
      const counter = await mongoose.connection.db.collection('counters').findOneAndUpdate(
        { _id: 'order_seq' },
        { $inc: { seq: 1 } },
        { 
          upsert: true, 
          returnDocument: 'after'
        }
      );
      
      return counter.seq || 1;
    } catch (error) {
      console.error('Error getting next order ID:', error);
      
      const OrderModel = require('../app/models/OrderModel');
      const maxOrder = await OrderModel.findOne({}, {}, { sort: { '_id': -1 } });
      const nextId = maxOrder ? (parseInt(maxOrder._id) + 1) : 1;
      
      await mongoose.connection.db.collection('counters').updateOne(
        { _id: 'order_seq' },
        { $set: { seq: nextId } },
        { upsert: true }
      );
      
      return nextId;
    }
  }

  // Tạo user với _id tuần tự an toàn
  static async createUserWithSequentialId(userData, maxRetries = 5) {
    const UserModel = require('../app/models/UserModel');
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        // Lấy ID tiếp theo
        const nextId = await this.getNextUserId();
        
        // Tạo user với _id cụ thể
        const userWithId = {
          _id: nextId,
          ...userData
        };
        
        const user = await UserModel.create(userWithId);
        console.log(`✅ Created user with sequential ID: ${nextId}`);
        
        return { success: true, user };
        
      } catch (error) {
        if (error.code === 11000 && error.keyPattern?._id && retryCount < maxRetries - 1) {
          console.log(`🔄 ID collision detected, retry ${retryCount + 1}/${maxRetries}`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
        } else if (error.code === 11000 && !error.keyPattern?._id) {
          // Duplicate key khác email/phone
          return { 
            success: false, 
            error: `Duplicate field: ${Object.keys(error.keyPattern)[0]}`,
            isDuplicateField: true 
          };
        } else {
          return { success: false, error: error.message };
        }
      }
    }
    
    return { success: false, error: "Không thể tạo user sau nhiều lần thử" };
  }

  // Reset tất cả counters
  static async resetAllCounters() {
    try {
      const UserModel = require('../app/models/UserModel');
      const OrderModel = require('../app/models/OrderModel');
      
      // Reset user counter
      const maxUser = await UserModel.findOne({}, {}, { sort: { '_id': -1 } });
      const maxUserId = maxUser ? parseInt(maxUser._id) : 0;
      
      // Reset order counter
      const maxOrder = await OrderModel.findOne({}, {}, { sort: { '_id': -1 } });
      const maxOrderId = maxOrder ? parseInt(maxOrder._id) : 0;
      
      await mongoose.connection.db.collection('counters').bulkWrite([
        {
          updateOne: {
            filter: { _id: 'user_seq' },
            update: { $set: { seq: maxUserId } },
            upsert: true
          }
        },
        {
          updateOne: {
            filter: { _id: 'order_seq' },
            update: { $set: { seq: maxOrderId } },
            upsert: true
          }
        }
      ]);
      
      console.log(`🔧 Reset counters - User: ${maxUserId}, Order: ${maxOrderId}`);
      return { success: true, user: maxUserId, order: maxOrderId };
      
    } catch (error) {
      console.error('Error resetting counters:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SequentialIdHelper;