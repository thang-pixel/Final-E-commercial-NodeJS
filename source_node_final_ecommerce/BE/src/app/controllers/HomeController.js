const UserModel = require("../models/userModel");

class HomeController{
    // [GET] | /
    index(req, res){
        UserModel.find({})
        .then(data => {
            if (data){
                console.log(data)
                res.json(data);
            } else{
                // res.send("Not have any users");
            }
        })
        .catch(err => {
            console.error(err);
            res.status(500).send('Internal server error');
        });
    }

    
}

module.exports = new HomeController();