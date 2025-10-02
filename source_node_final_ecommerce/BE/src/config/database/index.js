const mongoose = require('mongoose');
require('dotenv').config({path: __dirname + '/../../../.env'})

// const db_name = 'e_commerce_final';


async function connect(){ 
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connect successfully to MongoDB');
    } catch (error) {
        console.log('Connect failed to MongoDB');
        console.log(error);
    }
}

module.exports = {connect};