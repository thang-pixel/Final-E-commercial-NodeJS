const { PRODUCT_STATUSES, USER_ROLES } = require('../../constants/dbEnum');
const {
  sortObj,
  filterProduct,
  paginationParam,
  selectFieldByRole,
} = require('../../utils/searchUtil');
const ProductModel = require('../models/ProductModel');

class ProductController {
  // [GET] | /api/products
  // Hỗ trợ: ?category_id=1&brand_ids=1,2,3&range_prices=100-500&ratings=4&sort=price_asc&sort=createdAt_desc
  async index(req, res) {
    try {
      const { category_id } = req.query;
      const { brand_ids, range_prices, ratings } = req.query;
      let { keyword = '' } = req.query;
      console.log('Query parameters:', req.query);

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

      // console.log('sort ', req.query);

      const sort = sortObj(SORT_WHITELIST, 'name', req);

      // --- Pagination ---
      const { page, limit, skip } = paginationParam(req, 5);

      // hide fields based on role
      let fieldsToHide = selectFieldByRole(req.user?.role);

      // --- Query ---
      const opts = { collation: { locale: 'vi', strength: 1 } }; // hỗ trợ tên có dấu
      const [items, total] = await Promise.all([
        ProductModel.find(filter, null, opts)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .select(fieldsToHide)
          .lean(),
        ProductModel.countDocuments(filter),
      ]);

      // tinh toán tổng số trang
      const totalPages = Math.max(1, Math.ceil(total / limit)); // luôn >= 1 để đáp ứng yêu cầu hiển thị số trang

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

  // [GET] | /products/search elastic
  async search(req, res) {
    const q = req.query.q || '';
    const page = parseInt(req.query.page || '1', 10);
    const size = parseInt(req.query.size || '12', 10);
    const from = (page - 1) * size;

    try {
      // const result = await es.search({
      //   index: 'products',
      //   from,
      //   size,
      //   query: q
      //     ? {
      //         multi_match: {
      //           query: q,
      //           fields: ['name^3', 'description', 'category'],
      //           fuzziness: 'AUTO',
      //         },
      //       }
      //     : { match_all: {} },
      // });

      // res.json({
      //   total: result.hits.total.value,
      //   items: result.hits.hits.map((h) => h._source),
      // });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Search error' });
    }
  }

  // [GET] | /products/:slug
  async show(req, res) {
    try {
      if (!req.params.slug)
        return res
          .status(400)
          .json({ success: false, message: 'Missing slug' });
      const slug = decodeURIComponent(req.params.slug).trim().toLowerCase();

      // select fields to hide with role
      let fieldsToHide = selectFieldByRole(req.user?.role);
      // console.log(req.user);

      const doc = await ProductModel.findOne({ slug })
        .select(fieldsToHide)
        .lean();

      if (!doc)
        return res
          .status(404)
          .json({ success: false, message: 'Product not found' });
      return res.json({ success: true, data: doc, message: 'OK' });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        data: null,
        error,
      });
    }
  }

  // [GET] | /products/:id/detail
  async detail(req, res) {
    let { id } = req.params;
    id = parseInt(id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
        data: null,
      });
    }

    try {
      const data = await ProductModel.findOne({ _id: id });

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
    const {
      name,
      price,
      description,
      category_id,
      brand_id,
      variants,
      status,
      specifications,
    } = req.body;

    const parseVariants = Array.isArray(variants)
      ? variants
      : JSON.parse(variants || '[]');
    const parseSpecifications = Array.isArray(specifications)
      ? specifications
      : JSON.parse(specifications || '[]');

    // check name not exist
    const existingProduct = await ProductModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Tên sản phẩm đã tồn tại',
        data: null,
      });
    }

    if (!req.files || req.files.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Cần ít nhất 3 ảnh sản phẩm',
        data: null,
      });
    }

    console.log('Uploaded files:', req.files);
    const thumbnailImage = req.files?.thumbnail?.[0];
    const thumbnail = thumbnailImage
      ? {
          img_url: thumbnailImage.path,
          type: 'THUMBNAIL',
          id: 1,
        }
      : null;

    const images =
      req.files?.images?.map((file, index) => ({
        img_url: file.path,
        type: 'IMAGES',
        id: index + 2,
      })) || [];

    const allImages = thumbnail ? [thumbnail, ...images] : images;

    try {
      let minPrice = Infinity;
      let maxPrice = -Infinity;
      parseVariants.forEach((variant) => {
        const variantPrice = Number(variant.price);
        if (variantPrice < minPrice) minPrice = variantPrice;
        if (variantPrice > maxPrice) maxPrice = variantPrice;
      });

      const newProduct = new ProductModel({
        name,
        price,
        description,
        category_id,
        brand_id,
        specifications: parseSpecifications,
        variants: parseVariants,
        status,
        images: allImages,
        min_price: minPrice === Infinity ? 0 : minPrice,
        max_price: maxPrice === -Infinity ? 0 : maxPrice,
      });
      await newProduct.save();
      res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm thành công',
        data: newProduct,
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

  //[PATCH] /products/:id/change-status
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
