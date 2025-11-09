const { globalLimiter, authLimiter } = require('../security/rateLimit');
const userRoute = require('./userRoute');
const cartRoute = require('./cartRoute'); 
const productRoute = require('./productRoute'); 
const categoryRoute = require('./categoryRoute'); 
const brandRoute = require('./brandRoute'); 
const orderRoute = require('./orderRoute'); 
const reviewRoute = require('./reviewRoute'); 
const paymentRoute = require('./paymentRoute'); 
const promotionRoute = require('./promotionRoute'); 
const homeRoute = require('./homeRoute');
var createError = require('http-errors');
const authRoute = require('./authRoute');
const { adminRequired } = require('../app/middlewares/AuthMiddleware');

function route(app) {
    app.use(globalLimiter);
    // app.use('/api/auth', authLimiter, authRoute);
    app.use('/api/auth', authLimiter, authRoute);
    app.use('/api/cart', cartRoute);
    app.use('/api/users', authLimiter, userRoute);
    app.use('/api/products', productRoute);
    app.use('/api/brands', brandRoute);
    app.use('/api/categories', categoryRoute);
    app.use('/api/orders', orderRoute);
    // app.use('/api/checkout', checkoutRoute);
    app.use('/api/reviews', reviewRoute);
    // app.use('/api/addresses', addressRoute);
    app.use('/api/payments', paymentRoute);
    app.use('/api/promotions', promotionRoute);
    // app.use('/api/wishlist', authLimiter, wishlistRoute);
    // app.use('/api/notifications', authLimiter, notificationRoute); 

    app.use('/api/admin', adminRequired, (req, res) => {
        res.status(200).json({ message: 'Admin route is working' });
    });
    app.use('/api', homeRoute);
    
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
        next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {  
        // render the error page
        res.status(err.status || 500).json({
            status: err.status || 500,
            message: err.message,
        });
    });
}
module.exports = route;
