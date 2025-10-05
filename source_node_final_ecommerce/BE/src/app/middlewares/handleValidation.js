// src/middlewares/handleValidation.js
const { validationResult } = require('express-validator');

module.exports = function handleValidation(req, res, next) {
  const result = validationResult(req);
//   console.log('Validation Result: ', result);
  if (result.isEmpty()) return next();

  const errors = result.array().map(e => e.msg);
  // Lưu flash + redirect (hoặc render lại với errors)
  req.flash('error', errors);
  // nhớ lưu lại dữ liệu user nhập (nếu cần) vào session để repopulate
  req.session.formData = req.body;
  return res.status(422).json({ success: false, message: 'Invalid data', errors });

};
