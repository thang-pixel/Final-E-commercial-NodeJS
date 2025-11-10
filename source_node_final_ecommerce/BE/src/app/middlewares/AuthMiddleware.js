const { body } = require('express-validator');
const { USER_ROLES } = require('../../constants/dbEnum');
const jwt = require('jsonwebtoken');
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

const roleRequired = (req, res, next) => {
  if (!req.user || ![USER_ROLES.ADMIN, USER_ROLES.CUSTOMER].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// nho sua lai comment
const adminRequired = (req, res, next) => {
  // if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
  //   return res.status(403).json({ message: 'Admin access required' });
  // }
  next();
};
module.exports = { 
  authRequired,
  roleRequired,
  adminRequired,
};