const homeRoute = require('./homeRoute');
const userRoute = require('./userRoute');
const imageRoute = require('./imageRoute');



function route(app) {
    // features
    

    app.use('/api/users', userRoute);
    
    app.use('/api/files', imageRoute);
    // default
    app.use('/api', homeRoute);
}

module.exports = route;