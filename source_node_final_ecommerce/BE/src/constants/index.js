require("dotenv").config({ path: __dirname + "/../../.env" });
const path = require('path')
// console.log(path.join(__dirname + '/../../.env'))

module.exports = {
    PORT: parseInt(process.env.PORT) || 8001,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: parseInt(process.env.DB_PORT) || 27017,
    DB_NAME: process.env.DB_NAME,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET || 'thuyen_jwt' 
}
