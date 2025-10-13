// src/middlewares/handleValidation.js
const { validationResult } = require('express-validator');

module.exports = function handleValidation(req, res, next) {
  const result = validationResult(req);
//   console.log('Validation Result: ', result);
  if (result.isEmpty()) return next();
  const errors = result.array().map(e => e.msg);
  console.log('Validation Errors: ', errors);
  return res.status(422).json({ success: false, message: 'Sai dữ liệu', errors });
};
