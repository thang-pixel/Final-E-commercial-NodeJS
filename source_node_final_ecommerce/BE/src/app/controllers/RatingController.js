const RatingModel = require('../models/RatingModel');

class RatingController {
    // [GET] | /ratings
    async index(req, res) {
        
    }
 

    // [GET] /api/ratings/:product_id/ratings-by-product
    async ratingsByProductId(req, res) {
        const { product_id } = req.params;
        const prodIdParsed = parseInt(product_id, 10);
        if (!prodIdParsed) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
                data: null,
            });
        }
        try {
            // // Logic to fetch ratings by prodIdParsed goes here
            // const ratings = await RatingModel.find({ product_id: prodIdParsed });

            // // thống kê
            // const averageRating = await RatingModel.aggregate([
            //     { $match: { product_id: prodIdParsed } },
            //     { $group: {
            //         _id: '$product_id',
            //         averageRating: { $avg: '$rating' },
            //         ratings: { $sum: 1 },
            //     }},
            // ]);

            const [ratings, average_rating] = await Promise.all([
                RatingModel.find({ product_id: prodIdParsed }),
                RatingModel.aggregate([
                    { $match: { product_id: prodIdParsed } },
                    { $group: {
                        _id: '$product_id',
                        average_rating: { $avg: '$rating' },
                        ratings: { $sum: 1 },
                    }},
                ]),
            ])

            return res.status(200).json({
                success: true,
                message: 'Danh sách đánh giá theo product ID',
                data: ratings,
                average_rating: average_rating[0] || { average_rating: 0, ratings: 0 },
            });
        } catch (error) {
            console.error('Lỗi khi lấy đánh giá:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server: ' + error.message,
                data: null,
                error,
            });
        }
    }

    // [GET] /api/ratings/:user_id/ratings-by-user
    async ratingsByUserId(req, res) {
        const { user_id } = req.params;
        const userIdParsed = parseInt(user_id, 10);
        if (!userIdParsed) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required',
                data: null,
            });
        }   
        try {
            // Logic to fetch ratings by userIdParsed goes here
            const ratings = await RatingModel.find({ user_ref: userIdParsed });
            return res.status(200).json({
                success: true,
                message: 'Danh sách đánh giá theo user ID',
                data: ratings,
            });
        }
        catch (error) {
            console.error('Lỗi khi lấy đánh giá:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server: ' + error.message,
                data: null,
                error,
            });
        }
    }
}
 
module.exports = new RatingController();