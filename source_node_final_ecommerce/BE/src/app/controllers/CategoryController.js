const CategoryModel = require('../models/CategoryModel');

class CategoryController {
    // [GET] | api/Categorys
    async index(req, res) {
        let { page, limit, search } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 20;
        let query = search
            ? {
                  $or: [
                      { name: { $regex: search, $options: 'i' } },
                      { slug: { $regex: search, $options: 'i' } },
                  ],
              }
            : {};

        try {
            const data = await CategoryModel.find(query)
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });
            // console.log(data);

            const total = await CategoryModel.countDocuments(query);
            const totalPages = Math.ceil(total / limit);

            res.status(200).json({
                // Sử dụng các trường dữ liệu rõ ràng hơn
                status: 200,
                success: true,
                message:
                    data.length > 0
                        ? 'Lấy danh sách danh mục thành công'
                        : 'Không tìm thấy danh mục nào',

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

    // [GET] | api/categories/:slug
    async detail(req, res) {
        let { slug } = req.params;
        let query = slug ? { slug } : {};

        try {
            const data = await CategoryModel.findOne(query);

            if (data) {
                res.status(200).json({
                    success: true,
                    message: 'Chi tiết danh mục',
                    data,
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Chưa có danh mục',
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

    // [POST] | api/categories
    async store(req, res, next) {
        let { name, description, image } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục không được để trống',
                data: null,
            });
        }
        try {
            const existingCategory = await CategoryModel.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'danh mục đã tồn tại',
                    data: null,
                });
            }
            const newCategory = new CategoryModel({ name, description, image });
            await newCategory.save();
            return res.status(201).json({
                success: true,
                message: 'Tạo danh mục thành công',
                data: newCategory,
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

    // [PUT] api/categories/edit/:id
    async update(req, res, next) {
        let { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'id không được để trống',
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
            const doc = await CategoryModel.findOneAndUpdate({ _id: id }, req.body, {
                new: true,
                runValidators: true, // Nên thêm để kiểm tra validation khi cập nhật
            });

            // 1. KIỂM TRA KẾT QUẢ TÌM KIẾM
            if (!doc) {
                // Trường hợp 1: Không tìm thấy tài liệu nào khớp với filter
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy danh mục để cập nhật.',
                });
            }

            // Trường hợp 2: Cập nhật thành công
            return res.status(200).json({
                success: true,
                message: 'Cập nhật nhân vật thành công.',
                data: doc, //  
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

module.exports = new CategoryController();
