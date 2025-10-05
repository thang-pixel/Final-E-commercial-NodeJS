const rateLimit = require('express-rate-limit');

exports.globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // tối đa 40 req / 15'
  standardHeaders: true,
  legacyHeaders: false
});

exports.authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50, // chống brute-force
  message: { error: 'Quá nhiều thử đăng nhập, vui lòng thử lại sau.' }
});
