const UserModel = require("../models/userModel");

class HomeController{
    // [GET] | /
    index(req, res){
        res.status(200).json({ message: 'Home route is working' });
    }

    
}

module.exports = new HomeController();