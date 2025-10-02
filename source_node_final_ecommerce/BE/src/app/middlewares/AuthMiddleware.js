const requireLogin = (req, res, next) => {
    // if (true) {
    //     return res.redirect('/login');
    // }
    next();
};

const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.session.username) {
            return res.redirect('/login');
        }
        if (!allowedRoles.includes(req.session.role)) {
            return res.redirect('/error/403');
        }
        next();
    };
};

module.exports = {
    requireLogin,
    requireRole
};