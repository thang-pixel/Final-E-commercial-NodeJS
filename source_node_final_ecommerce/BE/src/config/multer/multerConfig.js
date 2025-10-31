const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Hàm tạo storage cho từng folder upload
function createStorage(folderName) {
  // root/uploads/folderName
  const dir = path.join(__dirname, "../..", "uploads", folderName);

  // Nếu folder chưa có thì tạo mới
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_"+ file.originalname);
    },
  });
}

// Upload avatar
const uploadAvatar = multer({ storage: createStorage("avatars") });

// Upload product image
const uploadProduct = multer({ storage: createStorage("products") });

// Upload portfolio
const uploadPortfolio = multer({ storage: createStorage("portfolio") });

module.exports = { uploadAvatar, uploadProduct, uploadPortfolio };
