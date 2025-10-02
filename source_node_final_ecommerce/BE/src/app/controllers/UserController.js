const { schemaError } = require("../../utils/errorUtils");
const UserModel = require("../models/userModel");

let dataFake = [
  {
    id: 1,
    username: "admin",
    password: "admin",
    email: "admin@example.com",
    role: 'ADMIN'
  },
  { id: 2, username: "user1", password: "user1", email: "user1@example.com", role: 'USER' },
  { id: 3, username: "user2", password: "user2", email: "user2@example.com", role: 'USER' },
  { id: 4, username: "user3", password: "user3", email: "user3@example.com", role: 'USER' }
]
class UserController {
  // [GET] | /users
  index(req, res) {
    UserModel.find({})
      .then((data) => {
        if (data && data.length > 0) {
          //   console.log(data);
          res.status(200).json({ success: true, data, message: "Danh sach users tu database" });
        } else {
          res.status(200).json({ success: true, data: dataFake, message: "Danh sach users fake" });
          // res.status(404).json({message: "Not have any users"});
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
      });
  }

  // [POST] | /users
  store(req, res, next) {
    const { username, phone, email } = req.body;

    UserModel.findOne({ $or: [{ username }, { email }, { phone }] })
      .then((existData) => {
        if (existData) {
          res.status(400).json({ message: "User already existed" });
          return Promise.reject();
        }

        return new UserModel(req.body).save();
      })
      .then((savedData) => {
        if (savedData) {
          res.status(201).json({
            message: "User is created successfully.",
            savedData,
          });
        }
      })
      .catch((err) => {
        if (err) {
          console.error(schemaError(err.errors));
          res.status(500).json({ message: "Internal server error" });
        }
      });
  }

  // [GET] /users/:username/edit
  edit(req, res, next) {
    UserModel.findOne({ username: req.params.username })
      .then((data) => {
        if (!data) return res.status(404).json({ message: "User not found" });
        res.status(200).json(data);
      })
      .catch(next);
  }

  // [PUT] /users/:username
  update(req, res, next) {
    UserModel.updateOne({ username: req.params.username }, req.body)
      .then((data) => {
        if (data.modifiedCount === 0) {
          return res
            .status(404)
            .json({ message: "User not found or no changes" });
        }
        res.status(200).json({ message: "Updated successfully" });
      })
      .catch(next);
  }

  // [PATCH] | /users/:username/change-password
  changePassword(req, res, next) {
    const { new_password, old_password } = req.body;
    UserModel.findOne({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(404).json({ message: "User not found" });
          return null;
        }

        // So sánh mật khẩu cũ
        if (user.password !== old_password) {
          res.status(400).json({ message: "Incorrect old password" });
          return null;
        }

        // TODO: nên hash new_password trước khi lưu (dùng bcrypt)
        user.password = new_password;

        return user.save();
      })
      .then((updatedUser) => {
        if (!updatedUser) return;

        res.status(200).json({ message: "Password changed successfully" });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
      });
  }

  
}

module.exports = new UserController();
