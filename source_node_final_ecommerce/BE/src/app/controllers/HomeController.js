const UserModel = require("../models/UserModel");

class HomeController{
    // [GET] | /
    index(req, res){
        res.status(200).json({ message: 'Home route is working' });
    }

    // [GET] | /api/home/new-products
    async newProducts(req, res){
        res.status(200).json({ message: 'New Products route is working' });
    }

    // [GET] | /api/home/best-sellers
    async bestSellers(req, res){
        res.status(200).json({ message: 'Best Sellers route is working' });
    }
}

module.exports = new HomeController();