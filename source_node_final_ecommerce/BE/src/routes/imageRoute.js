const express = require("express");
const path = require("path");
const route = express.Router();
const multer = require("multer");

const destinationImg = path.join(__dirname, "../uploads/avatars/");
// console.log(__dirname)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, destinationImg),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
// Add file filter to only accept images
const fileFilter = function (req, file, cb) {
  // Accept only images
  if (!file.originalname.match(/\.(jpg|jpeg|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

route.get("/", (req, res) => {
  res.send(`
    <h1>File Upload Demo</h1>
    <form action="files/multiple-upload" method="post" enctype="multipart/form-data">
      <input type="file" name="thumbnail" />
      <input type="file" name="images" multiple/>
      <button type="submit">Upload</button>
    </form>
  `);
});

const authMiddleware = require("../app/middlewares/AuthMiddleware");
const uploadMiddleware = require("../app/middlewares/UploadMiddleware");

const ImageController = require("../app/controllers/ImageController"); 

route.get("/:filename", authMiddleware.requireLogin, ImageController.getImage);

route.post("/upload", upload.single("uploadedFile"), uploadMiddleware, (req, res) => {
  res.send(`File uploaded successfully: ${req.file.filename}`);
}); 

route.post(
  "/multiple-upload",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  uploadMiddleware,
  (req, res) => {
    res.json({
      message: "Profile updated successfully",
    });
  }
);

module.exports = route;
