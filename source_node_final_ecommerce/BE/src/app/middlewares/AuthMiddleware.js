const jwt = require('jsonwebtoken');
const { USER_ROLES } = require('../../constants/dbEnum');
const jwt = require('jsonwebtoken');

// yêu cầu đăng nhập có token hợp lệ
const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded user:", decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

// const roleRequired = (req, res, next) => {
//   if (!req.user || ![USER_ROLES.ADMIN, USER_ROLES.CUSTOMER].includes(req.user.role)) {
//     return res.status(403).json({ message: 'Forbidden' }); 
// }


// Optional: không có token thì coi là guest, có token thì gắn req.user
// truy cập api public và phân quyền khách 
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
function authRequired2(req, res, next) {
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
  authRequired2,
  roleRequired,
  adminRequired,
};
