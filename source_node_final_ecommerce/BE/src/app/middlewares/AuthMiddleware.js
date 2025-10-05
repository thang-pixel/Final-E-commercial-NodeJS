const { body } = require('express-validator');
const { USER_ROLES } = require('../../constants/dbEnum');

const authRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

const roleRequired = (req, res, next) => {
  if (!req.user || ![USER_ROLES.ADMIN, USER_ROLES.CUSTOMER].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

const adminRequired = (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
module.exports = { 
  authRequired,
  roleRequired,
  adminRequired,
};