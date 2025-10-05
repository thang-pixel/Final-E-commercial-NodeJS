const BrandModel = require('../models/BrandModel');

class BrandController {
    // [GET] | api/brands
    async index(req, res) {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20; 
        let query = search ? { name: { $regex: search, $options: 'i' } } : {};

        try {
            const data = await BrandModel.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });
            // console.log(data);

            const total = await BrandModel.countDocuments(query);
            const totalPages = Math.ceil(total / limit); 

            res.status(200).json({
                // Sử dụng các trường dữ liệu rõ ràng hơn
                status: 200,
                success: true,
                message:
                    data.length > 0
                        ? 'Lấy danh sách thương hiệu thành công'
                        : 'Không tìm thấy thương hiệu nào',

                // Khối meta/pagination chứa thông tin phân trang
                meta: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limit, // Đổi 'limit' thành 'itemsPerPage' cho rõ ràng
                    isLastPage: page >= totalPages, // Thêm trường kiểm tra trang cuối
                },

                // Khối dữ liệu chính
                data: data,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                data: null,
                error,
            });
        }
    }

    // [GET] | api/brands/:slug
    async detail(req, res) {
        let { slug } = req.params;
        let query = slug ? { slug } : {};

        try {
            const data = await BrandModel.findOne(query);

            if (data) {
                res.status(200).json({
                    success: true,
                    message: 'Chi tiết thương hiệu',
                    data,
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Chưa có thương hiệu',
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

    // [POST] | api/brands
    async store(req, res, next) {
        let { name, description, image } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Tên thương hiệu không được để trống',
                data: null,
            });
        }
        try {
            const existingBrand = await BrandModel.findOne({ name });
            if (existingBrand) {
                return res.status(400).json({
                    success: false,
                    message: 'Thương hiệu đã tồn tại',
                    data: null,
                });
            }
            const newBrand = new BrandModel({ name, description, image });
            await newBrand.save();
            return res.status(201).json({
                success: true,
                message: 'Tạo thương hiệu thành công',
                data: newBrand,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                data: null,
                error,
            });
        }
    }

    // [PUT] api/brands/:slug/edit
    async update(req, res, next) {
        let { slug } = req.params;
        if (!slug) {
            return res.status(400).json({
                success: false,
                message: 'Slug không được để trống',
                data: null,
            });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu cập nhật không được để trống',
                data: null,
            });
        }

        try {
            let brand = await BrandModel.findOne({ slug });
            if (!brand) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy thương hiệu',
                    data: null,
                });
            }

            // Cập nhật thông tin thương hiệu
            Object.assign(brand, req.body);
            await brand.save();

            return res.status(200).json({
                success: true,
                message: 'Cập nhật thương hiệu thành công',
                data: brand,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                data: null,
                error,
            });
        }
    }
}

module.exports = new BrandController();
