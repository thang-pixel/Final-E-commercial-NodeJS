const mongoose = require('mongoose'); 
const { MONGO_URI } = require('../../constants');

async function connect(){ 
    try {
        console.log('Connecting to MongoDB...', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connect successfully to MongoDB');
    } catch (error) {
        console.log('Connect failed to MongoDB');
        console.log(error);
    }
}

module.exports = {connect};