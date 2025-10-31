require("dotenv").config({ path: __dirname + "/../../.env" });
const path = require('path')        
// console.log(path.join(__dirname + '/../../.env'))


console.log('Config Constants:', {
    PORT: parseInt(process.env.PORT) || 8001,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT) || 27017,
    DB_NAME: process.env.DB_NAME,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
});

module.exports = {
    PORT: parseInt(process.env.PORT) || 8001,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT) || 27017,
    DB_NAME: process.env.DB_NAME,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'thuyen_jwt' 
}
