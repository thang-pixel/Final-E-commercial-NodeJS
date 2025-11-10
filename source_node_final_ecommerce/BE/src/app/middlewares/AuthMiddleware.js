const jwt = require('jsonwebtoken');
const { USER_ROLES } = require('../../constants/dbEnum');

// Optional: không có token thì coi là guest, có token thì gắn req.user
function tryAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    req.user = { role: 'guest' };
    return next();
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET); // { id, role, ... }
    req.user = payload;
    return next();
  } catch (e) {
    // Token có nhưng sai/hết hạn → coi là guest (public vẫn chạy),
    // nếu muốn chặn hẳn hãy đổi sang: return res.status(401).json({ success:false, message:'Invalid token' })
    req.user = { role: 'guest' };
    return next();
  }
}

// Bắt buộc đã đăng nhập (có user hợp lệ, KHÔNG phải guest)
function authRequired(req, res, next) {
  if (!req.user || req.user.role === 'guest') {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  return next();
}

// Yêu cầu thuộc 1 trong các role cho phép
function roleRequired(...roles) {
  return (req, res, next) => {
    const role = req.user?.role || 'guest';
    if (!roles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  };
}

// Chỉ admin
const adminRequired = roleRequired(USER_ROLES.ADMIN);

module.exports = {
  tryAuth,
  authRequired,
  roleRequired,
  adminRequired,
};
