const multer = require('multer');

const uploadMiddleware = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files uploaded.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Unexpected field name for file upload.' });
    }
    // For any other Multer error
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  // For non-Multer errors 
  res.status(500).json({ message: err.message });
}

module.exports = uploadMiddleware;