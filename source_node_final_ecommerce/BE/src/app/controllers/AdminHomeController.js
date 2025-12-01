
class AdminHomeController{
    // [GET] | /api/admin/home
    index(req, res){
        res.status(200).json({ message: 'Admin Home route is working' });
    }
}

module.exports = new AdminHomeController();