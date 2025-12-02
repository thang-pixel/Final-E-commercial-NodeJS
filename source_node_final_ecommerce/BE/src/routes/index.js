var createError = require('http-errors');

const productRoute = require('./productRoute'); 
const brandRoute = require('./brandRoute'); 
const categoryRoute = require('./categoryRoute'); 

const authRoute = require('./authRoute');
const userRoute = require('./userRoute');
const cartRoute = require('./cartRoute'); 
const orderRoute = require('./orderRoute'); 
const paymentRoute = require('./paymentRoute'); 
const promotionRoute = require('./promotionRoute'); 
const commentRoute = require('./commentRoute');
const ratingRoute = require('./ratingRoute');
const notifyRoute = require('./notificationRoute.js');
const homeRoute = require('./homeRoute');
const adminHomeRoute = require('./adminHomeRoute.js');


const { globalLimiter, authLimiter } = require('../security/rateLimit');
const { adminRequired, authRequired, tryAuth } = require('../app/middlewares/AuthMiddleware');

function route(app) {
    app.use(globalLimiter);
     // ✅ Gắn trước mọi route để luôn có req.user (guest/user/admin)
    app.use(tryAuth);
    // app.use('/api/auth', authLimiter, authRoute);
    app.use('/api/auth', authLimiter, authRoute);
    app.use('/api/users', authRequired, userRoute);
    app.use('/api/carts', authRequired, cartRoute);
    app.use('/api/products', productRoute);
    app.use('/api/product-variants', require('./productVariantRoute.js'));
    app.use('/api/brands', brandRoute);
    app.use('/api/categories', categoryRoute);
    app.use('/api/orders', orderRoute);
    // app.use('/api/addresses', addressRoute);
    app.use('/api/payment', paymentRoute);
    app.use('/api/promotions', promotionRoute);
    // app.use('/api/wishlist', authLimiter, wishlistRoute);
    app.use('/api/notifications', notifyRoute);
    app.use('/api/ratings', ratingRoute); 
    app.use('/api/comments', commentRoute);

    app.use('/api/admin', adminRequired, (req, res) => {
        res.status(200).json({ message: 'Admin route is working' });
    });
    app.use('/api/admin-home', adminHomeRoute);
    app.use('/api/home', homeRoute);
    
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404, 'API endpoint not found'));
    });

    // error handler
    app.use(function (err, req, res, next) {  
        // render the error page
        res.status(err.status || 500).json({
            status: err.status || 500,
            message: err.message,
            errors: err.errors || err,
        });
    });
}
module.exports = route;
