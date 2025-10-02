const PromotionModel = require('../models/PromotionModel');

class PromotionController {
    // [GET] | /promotions
    async index(req, res) {
        let { page, limit, search } = req.params;
        page = parseInt(page);
        limit = parseInt(limit);
        let query = search ? search : {};

        try {
            const data = await PromotionModel.find({ query })
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await PromotionModel.countDocuments(query);

            if (data && data.length > 0) {
                res.status(200).json({
                    success: true,
                    message: 'Danh sách chương trình',
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    data,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Chưa có chương trình',
                    data: null,
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                data: null,
                error,
            });
        }
    }

    // [GET] | /products
    async detail(req, res) {
        let { search } = req.params; 
        let query = search ? search : {};

        try {
            const data = await PromotionModel.findOne({ query }); 

            if (data && data.length > 0) {
                res.status(200).json({
                    success: true,
                    message: 'Chi tiết chương trình', 
                    data,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Chưa có chương trình',
                    data: null,
                });
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                data: null,
                error,
            });
        }
    }

    // [POST] | /Products
    async store(req, res, next) {}

    // [GET] /products/:name/edit
    async edit(req, res, next) {}

    // [PUT] /Products/:Productname
    async update(req, res, next) {}
}

module.exports = new ProductController();
