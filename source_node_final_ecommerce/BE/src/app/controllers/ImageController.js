
class ImageController{
    getImage(req, res) {
        // console.log(__dirname)
        const location  = req.query.location || 'avatars'; 

        const filePath = path.join(__dirname, "../../uploads/" + location, req.params.filename);
        res.sendFile(filePath);
    }
    
}

module.exports = new ImageController();