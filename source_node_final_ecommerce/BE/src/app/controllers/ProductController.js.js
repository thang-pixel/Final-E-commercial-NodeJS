const { PRODUCT_STATUSES } = require('../../constants/dbEnum');
const {
    sortObj,
    filterProduct,
    paginationParam,
} = require('../../utils/searchUtil');
const ProductModel = require('../models/ProductModel');


class ProductController {
    // [GET] | /api/products/search
    // Hỗ trợ: ?category_id=1&brand_ids=1,2,3&range_prices=100-500&ratings=4&sort=price_asc&sort=createdAt_desc
    async search(req, res) {
        try {
            const { category_id, keyword } = req.query;
            const { brand_ids, range_prices, ratings } = req.query;

            // --- Filter ---
            let filter = {
                status: PRODUCT_STATUSES.ACTIVE,
                deleted: false,
                name: {
                    $regex: keyword.trim(),
                    $options: 'i', // không phân biệt hoa/thường
                },
            };

            if (category_id) {
                filter.category_id = Number(category_id);
            }

            filter = filterProduct(filter, brand_ids, range_prices, ratings);

            // --- Sort ---
            const SORT_WHITELIST = {
                name: 'name',
                price: 'min_price',
                createdAt: 'createdAt',
                rating: 'average_rating',
            };

            const sort = sortObj(SORT_WHITELIST, 'name', req);

            // --- Pagination ---
            const { page, limit, skip, totalPages } = paginationParam(req, 5);

            // --- Query ---
            const opts = { collation: { locale: 'vi', strength: 1 } }; // hỗ trợ tên có dấu
            const [items, total] = await Promise.all([
                ProductModel.find(filter, null, opts)
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                ProductModel.countDocuments(filter),
            ]);

            return res.status(200).json({
                success: true,
                message: 'Danh sách sản phẩm',
                data: items,
                meta: {
                    currentPage: page,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit,
                    isLastPage: page >= totalPages,
                },
                sort,
            });
        } catch (error) {
            console.error('[Product.search] error:', error);
            return res.status(500).json({
                success: false,
                message: 'Lỗi server',
                error: error?.message || error,
            });
        }
    }

    // [GET] | /products/:slug
    async detail(req, res) {
        let { slug } = req.params;
        let query = slug ? { slug } : {};

        try {
            const data = await ProductModel.findOne(query);

            if (data && data.length > 0) {
                res.status(200).json({
                    success: true,
                    message: 'Chi tiết sản phẩm',
                    data,
                });
            } else {
                res.status(404).json({
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

    // [POST] | /products
    async store(req, res, next) {
        try {
            const newProduct = new ProductModel(req.body);
            const savedProduct = await newProduct.save();
            res.status(201).json({
                success: true,
                message: 'Tạo sản phẩm thành công',
                data: savedProduct,
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

    //[PATCH] /products/:id/status
    async changeStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            if (!Object.values(PRODUCT_STATUSES).includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Trạng thái không hợp lệ',
                    data: null,
                });
            }
            const updatedProduct = await ProductModel.findByIdAndUpdate(
                id,
                { status },
                { new: true, runValidators: true }
            );
            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Sản phẩm không tồn tại',
                    data: null,
                });
            }
            res.status(200).json({
                success: true,
                message: 'Cập nhật trạng thái sản phẩm thành công',
                data: updatedProduct,
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

    // [PUT] /products/:id
    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updatedProduct = await ProductModel.findByIdAndUpdate(
                id,
                req.body,
                { new: true, runValidators: true }
            );
            if (!updatedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Sản phẩm không tồn tại',
                    data: null,
                });
            }
            res.status(200).json({
                success: true,
                message: 'Cập nhật sản phẩm thành công',
                data: updatedProduct,
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

    // [DELETE] api/products/:id
    async softDelete(req, res, next) {
        try {
            const { id } = req.params;
            const c = await ProductModel.delete({ _id: id });
            if (c.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm để xóa',
                });
            }
            await ProductModel.updateOne(
                { _id: id },
                { status: PRODUCT_STATUSES.INACTIVE }
            );
            return res.status(200).json({
                success: true,
                message: 'Xóa sản phẩm thành công.',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                data: null,
                error,
            });
            next(error);
        }
    }

    // [PATCH] /products/:id/restore
    async restore(req, res, next) {
        try {
            const c = await ProductModel.restore({ _id: req.params.id });
            if (c.modifiedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy sản phẩm để khôi phục',
                    data: null,
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Khôi phục sản phẩm thành công',
                data: c,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi server',
                data: null,
                error,
            });
            next(error);
        }
    }

    // [DELETE] /products/:id/destroy
    async delete(req, res, next) {
        try {
            const { id } = req.params;
            // Tìm kiếm sản phẩm có trong đơn hàng nào không?
            const isInOrders = false; // TODO: check trong OrderModel
            if (isInOrders) {
                return res.status(400).json({
                    success: false,
                    message: 'Không thể xóa sản phẩm vì đã có trong đơn hàng',
                    data: null,
                });
            }
            const deletedProduct = await ProductModel.findByIdAndDelete(id);
            if (!deletedProduct) {
                return res.status(404).json({
                    success: false,
                    message: 'Sản phẩm không tồn tại',
                    data: null,
                });
            }
            res.status(200).json({
                success: true,
                message: 'Xóa sản phẩm thành công',
                data: deletedProduct,
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
}

module.exports = new ProductController();
