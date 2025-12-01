const { CATEGORY_STATUSES } = require('../../constants/dbEnum');
const CategoryModel = require('../models/CategoryModel');
const ProductModel = require('../models/ProductModel');
const BrandModel = require('../models/BrandModel');
const categoryUtil = require('../../utils/categoryUtil');
class CategoryController {
  // [GET] | api/Categorys
  async index(req, res) {
    let { page, limit, search, status } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 100;
    let query = search
      ? {
          $and: [
            { status: status || CATEGORY_STATUSES.ACTIVE },
            { deleted: false },
            {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
              ],
            },
          ],
        }
      : {
          status: status || CATEGORY_STATUSES.ACTIVE,
          deleted: false,
        };

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

  // [GET] | api/categories/tree
  async getCategoryTree(req, res) {
    try {
      const tree = await categoryUtil.buildCategoryTree();

      res.status(200).json({
        success: true,
        message: 'Cây danh mục',
        data: tree,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server' + error.message,
        data: null,
        error,
      });
    }
  }

  // [GET] | api/categories/root
  async getAllCategoryRoots(req, res) {
    try {
      const roots = await CategoryModel.find({ parent_id: null }).lean();

      const results = await Promise.all(
        roots.map(async (root) => {
          const children = await CategoryModel.find({
            parent_id: root._id,
          }).lean();
          return { ...root, children };
        })
      );

      res.status(200).json({
        success: true,
        message: 'Danh mục gốc',
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server' + error.message,
        data: null,
        error,
      });
    }
  }

  // [GET] | api/categories/:id/show
  async getDetailById(req, res) {
    let { id } = req.params;
    let query = id ? { _id: id, deleted: false } : {};
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
  // [GET] | api/categories/:slug
  async detail(req, res) {
    let { slug } = req.params;
    let query = slug ? { slug, deleted: false } : {};

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
    let { name, description, parent_id, status, attributes } = req.body;
    // if (!req.file) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Vui lòng upload ảnh',
    //     oldInput: req.body,
    //   });
    // }

    console.log('Add cate - body: ', req.body);

    const imageReq = req.file;
    const imageUrl = `${imageReq.path}`;
    console.log('Uploaded image URL:', imageUrl);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục không được để trống',
      });
    }
    if (!attributes) {
      return res.status(400).json({
        success: false,
        message: 'Thuộc tính danh mục không được để trống',
      });
    }
    if (!Array.isArray(attributes)) {
      try {
        attributes = JSON.parse(attributes);
      } catch (error) {
        attributes = [attributes];
      }
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
      const newCategory = new CategoryModel({
        name,
        description,
        image_url: imageUrl,
        status: status ? status : CATEGORY_STATUSES.ACTIVE,
        parent_id,
        attributes,
      });
      await newCategory.save();
      return res.status(201).json({
        success: true,
        message: 'Tạo danh mục thành công',
        data: newCategory,
      });
    } catch (error) {
      console.error('Error creating category:', error);
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

    if (req.file) {
      req.body.image = `/uploads/products/${req.file.filename}`;
    }

    try {
      const exist = await CategoryModel.findOne({
        name: req.body.name,
        _id: { $ne: id }, // bỏ qua chính bản ghi đang sửa
      });

      if (exist) {
        return res.status(400).json({
          success: false,
          message: `Tên danh mục "${req.body.name}" đã tồn tại.`,
        });
      }
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
        message: 'Cập nhật danh mục thành công.',
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

  // [DELETE] api/categories/:id
  async softDelete(req, res, next) {
    try {
      let { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'id không được để trống',
          data: null,
        });
      }
      id = parseInt(id);

      // kiem tra danh muc co san pham, hay thuong hieu khong
      const hasProducts = await ProductModel.findOne({ category_id: id }); // + index {categoryId:1}
      if (hasProducts) {
        return res.status(409).json({
          success: false,
          message: 'Không thể xoá: danh mục đang có sản phẩm.',
        });
      }
      const hasBrands = await BrandModel.findOne({ category_id: id }); // + index {categoryId:1}
      if (hasBrands) {
        return res.status(409).json({
          success: false,
          message: 'Không thể xoá: danh mục đang có thương hiệu.',
        });
      }

      const c = await CategoryModel.delete({ _id: id });
      if (c.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục để xóa',
        });
      }
      // await CategoryModel.updateOne(
      //   { _id: id },
      //   { status: CATEGORY_STATUSES.INACTIVE }
      // );
      return res.status(200).json({
        data: id,
        success: true,
        message: 'Xóa danh mục thành công.',
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }

  // [PATCH] /categories/:id/restore
  async restore(req, res, next) {
    try {
      const c = await CategoryModel.restore({ _id: req.params.id });
      if (c.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục để khôi phục',
        });
      }
      await CategoryModel.updateOne(
        { _id: req.params.id },
        { status: CATEGORY_STATUSES.ACTIVE }
      );
      return res.status(200).json({
        success: true,
        message: 'Khôi phục danh mục thành công.',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        data: null,
        error,
      });
    }
  }

  // [DELETE] /categories/:id/force
  async forceDestroy(req, res, next) {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID danh mục không được để trống',
      });
    }
    try {
      const hasProducts = await ProductModel.exists({ categoryId: id }); // + index {categoryId:1}
      if (hasProducts) {
        return res.status(409).json({
          success: false,
          message: 'Không thể xoá: danh mục đang có sản phẩm.',
        });
      }
      const c = await CategoryModel.deleteOne({ _id: id });
      if (c.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục để xóa',
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Xóa danh mục thành công.',
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
}

module.exports = new CategoryController();
