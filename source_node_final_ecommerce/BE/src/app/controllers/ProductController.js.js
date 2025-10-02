const ProductModel = require('../models/ProductModel');

class ProductController {
    // [GET] | /products
    async index(req, res) {
        let { page, limit, search } = req.params;
        page = parseInt(page);
        limit = parseInt(limit);
        let query = search ? search : {};

        try {
            const data = await ProductModel.find({ query })
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await ProductModel.countDocuments(query);

            if (data && data.length > 0) {
                res.status(200).json({
                    success: true,
                    message: 'Danh sách sản phẩm',
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    data,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Chưa có sản phẩm',
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
            const data = await ProductModel.findOne({ query }); 

            if (data && data.length > 0) {
                res.status(200).json({
                    success: true,
                    message: 'Chi tiết sản phẩm', 
                    data,
                });
            } else {
                res.status(200).json({
                    success: false,
                    message: 'Chưa có sản phẩm',
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
