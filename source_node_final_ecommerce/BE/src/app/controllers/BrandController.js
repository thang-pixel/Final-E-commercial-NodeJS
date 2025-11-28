
const { CATEGORY_STATUSES } = require('../../constants/dbEnum');
const BrandModel = require('../models/BrandModel');
const ProductModel = require('../models/ProductModel');

class BrandController {
  // [GET] | api/brands
  async index(req, res) {
    let { page, limit, search, status } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    let query = search ? { name: { $regex: search, $options: 'i' } } : {};
    if (status) {
      query.status = status;
    }
    try {
      const data = await BrandModel.find(query)
        .populate({
          path: 'category_id',
          select: '_id name slug', // chỉ lấy trường cần thiết
        })
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
  async show(req, res) {
    let { slug } = req.params;
    let query = slug ? { slug } : {};

    try {
      const data = await BrandModel.findOne(query).populate({
        path: 'category_id',
        select: '_id name slug',
      });

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

  // [GET] | api/brands/:id/detail
  async detail(req, res) {
    let { id } = req.params;
    let query = id ? { _id: id } : {};

    try {
      const data = await BrandModel.findOne(query).populate({
        path: 'category_id',
        select: '_id name slug',
      });

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
    let { name, description, category_id, status } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên thương hiệu không được để trống',
        data: null,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng upload logo thương hiệu',
        data: null,
      });
    }

    const imageUrl = req.file ? req.file.path : '';
    try {
      const existingBrand = await BrandModel.findOne({ name: { $regex: name, $options: 'i' } });
      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'Thương hiệu đã tồn tại',
          data: null,
        });
      }
      const newBrand = new BrandModel({
        name,
        description,
        image_url: imageUrl,
        category_id,
        status,
      });
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

  // [PUT] api/brands/:id/edit
  async update(req, res, next) {
    let { id } = req.params;
    id = parseInt(id);
    const { name, description, category_id, status } = req.body;
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
      req.body.image_url = req.file.path;
    }

    try {
      let brand = await BrandModel.findOne({ _id: id });
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thương hiệu',
          data: null,
        });
      }

      // Cập nhật thông tin thương hiệu
      if (name) brand.name = name;
      if (description) brand.description = description;
      if (category_id) brand.category_id = category_id;
      if (status) brand.status = status;
      if (req.body.image_url) brand.image_url = req.body.image_url;
      brand.deleted = status === 'INACTIVE' ? true : false;
      console.log('Updated brand data:', brand);
      await brand.save();

      return res.status(200).json({
        success: true,
        message: 'Cập nhật thương hiệu thành công',
        data: brand,
      });
    } catch (error) {
      console.error('Error updating brand:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server',
        data: null,
        error,
      });
    }
  }

  // [DELETE] api/brands/:id
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

      // Kiểm tra xem có sản phẩm nào thuộc thương hiệu này không
      const hasProducts = await ProductModel.findOne({ brand_id: id }); // + index {brandId:1}
      if (hasProducts) {
        return res.status(409).json({
          success: false,
          message: 'Không thể xoá: thương hiệu đang có sản phẩm.',
        });
      }


      const c = await BrandModel.delete({ _id: id });
      if (c.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thương hiệu để xóa',
        });
      }
      // await BrandModel.updateOne(
      //   { _id: id },
      //   { status: CATEGORY_STATUSES.INACTIVE }
      // );
      return res.status(200).json({
        success: true,
        data: id,
        message: 'Xóa thương hiệu thành công.',
      });
    } catch (error) {
      console.error(error);
      // next(error);
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
