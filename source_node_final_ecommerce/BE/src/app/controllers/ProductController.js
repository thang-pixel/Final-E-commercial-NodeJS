const { PRODUCT_STATUSES, USER_ROLES } = require('../../constants/dbEnum');
const {
  sortObj,
  filterProduct,
  paginationParam,
  selectFieldByRole,
} = require('../../utils/searchUtil');
const { buildSku } = require('../../utils/variantUtil');
const ProductModel = require('../models/ProductModel');
const ProductVariant = require('../models/ProductVariant');

class ProductController {
  // [GET] | /api/products
  // Hỗ trợ: ?category_id=1&brand_ids=1,2,3&range_prices=100-500&ratings=4&sort=price_asc&sort=createdAt_desc
  async index(req, res) {
    try {
      const { category_id } = req.query;
      const { brand_ids, range_prices, ratings, status } = req.query;
      let { keyword = '' } = req.query;
      console.log('Query parameters:', req.query);

      // --- Filter ---
      let filter = { 
        deleted: false,
        name: {
          $regex: keyword.trim(),
          $options: 'i', // không phân biệt hoa/thường
        },
      };

      if (status && Object.values(PRODUCT_STATUSES).includes(status)) {
        filter.status = status;
      }

      if (category_id) {
        filter.category_id = Number(category_id);
      }

      filter = filterProduct(filter, brand_ids, range_prices, ratings);

      // --- Sort ---
      const SORT_WHITELIST = {
        name: 'name',
        price: 'min_price',
        min_price: 'min_price',
        max_price: 'max_price',
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
          .populate({ path: 'category_id', select: '_id name slug' })
          .populate({ path: 'brand_id', select: '_id name slug' })
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

    console.log('👉 Product ID:', id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ',
        data: null,
      });
    }

    try {
      const data = await ProductModel.findOne({ _id: id })
        .populate({ path: 'category_id', select: '_id name slug attributes' })
        .populate({ path: 'brand_id', select: '_id name slug' })
        .lean();
      // console.log('👉 Product found:', data );
      
      if (data) {
        const variants = await ProductVariant.find({ product_id: id });
        console.log('👉 Variants found:', variants.length);
        
        data.variants = variants;
        const resp = { ...data, variants };
        console.log('👉 Response data:', resp);

        res.status(200).json({
          success: true,
          message: 'Chi tiết sản phẩm',
          data: resp,
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
      let {
        name,
        description,
        category_id,
        brand_id,
        variants,
        status,
        specifications,
      } = req.body;

      console.log('👉 Body nhận được:', req.body);
      console.log('👉 Files nhận được:', req.files);

      // Ép kiểu id về Number cho khớp schema
      category_id = parseInt(category_id, 10);
      brand_id = parseInt(brand_id, 10);

      // ✅ Parse JSON bên trong try để bắt được lỗi
      let parseVariants;
      let parseSpecifications;

      try {
        parseVariants = Array.isArray(variants)
          ? variants
          : JSON.parse(variants || '[]');

        parseSpecifications = Array.isArray(specifications)
          ? specifications
          : JSON.parse(specifications || '[]');
      } catch (e) {
        console.error('❌ Lỗi JSON.parse variants/specifications:', e);
        return res.status(400).json({
          success: false,
          message:
            'Dữ liệu biến thể hoặc thông số kỹ thuật không hợp lệ (JSON)',
          data: null,
        });
      }

      console.log('👉 Variants (sau parse):', parseVariants);
      console.log('👉 Specifications (sau parse):', parseSpecifications);

      // check name not exist
      const existingProduct = await ProductModel.findOne({ name });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Tên sản phẩm đã tồn tại', 
        });
      }

      // ✅ Với multer.fields, req.files là object { thumbnail: [], images: [] }
      const thumbnailFiles = req.files?.thumbnail || [];
      const imageFiles = req.files?.images || [];
      const totalFiles = thumbnailFiles.length + imageFiles.length;

      if (totalFiles < 3) {
        return res.status(400).json({
          success: false,
          message: 'Cần ít nhất 3 ảnh sản phẩm',
          data: null,
        });
      }

      const thumbnailImage = thumbnailFiles[0];
      const thumbnail = thumbnailImage
        ? {
            img_url: thumbnailImage.path,
            type: 'THUMBNAIL',
            id: 1,
          }
        : null;

      const images = imageFiles.map((file, index) => ({
        img_url: file.path,
        type: 'IMAGES',
        id: index + 2,
      }));

      const allImages = thumbnail ? [thumbnail, ...images] : images;

      // Tính min/max price từ variants
      let minPrice = Infinity;
      let maxPrice = -Infinity;

      parseVariants.forEach((variant) => {
        const variantPrice = Number(variant.price);
        if (!Number.isNaN(variantPrice)) {
          if (variantPrice < minPrice) minPrice = variantPrice;
          if (variantPrice > maxPrice) maxPrice = variantPrice;
        }
      });

      const newProduct = new ProductModel({
        name,
        description,
        category_id,
        brand_id,
        specifications: parseSpecifications,
        status,
        images: allImages,
        min_price: minPrice === Infinity ? 0 : minPrice,
        max_price: maxPrice === -Infinity ? 0 : maxPrice,
      });

      await newProduct.save();
      console.log('✅ New product created:', newProduct._id);

      // ===================== LƯU VARIANTS =====================
      if (parseVariants.length > 0) {
        const ProductVariantModel = require('../models/ProductVariant');

        const variantsToInsert = parseVariants.map(async (variant, idx) => {
          console.log(`👉 Variant raw [${idx}]:`, variant);

          // Chuẩn hoá attributes: cho phép FE gửi object hoặc array
          let attrs = variant.attributes;
          if (!attrs) {
            throw new Error(`Thiếu thuộc tính biến thể ở variant index ${idx}`);
          }

          if (!Array.isArray(attrs)) {
            attrs = Object.entries(attrs).map(([code, value]) => ({
              code,
              value,
            }));
          }

          // Validate giá: original_price là giá gốc, price là giá bán
          const price = Number(variant.price);
          const originalPrice =
            variant.original_price != null
              ? Number(variant.original_price)
              : price;

          if (!Number.isFinite(price)) {
            throw new Error(`Giá bán không hợp lệ ở variant index ${idx}`);
          }

          if (!Number.isFinite(originalPrice)) {
            throw new Error(`Giá gốc không hợp lệ ở variant index ${idx}`);
          }

          if (originalPrice > price) {
            throw new Error(
              `Giá gốc không được lớn hơn giá bán (variant index ${idx})`
            );
          }

          const stock = Number(variant.stock_quantity ?? 0);

          const SKU = buildSku(newProduct._id, attrs);

          // check SKU unique
          const existingVariant = await ProductVariant.findOne({ SKU });
          if (existingVariant) {
            throw new Error(`SKU đã tồn tại: ${SKU} (variant index ${idx})`);
          }
          console.log(`👉 Generated SKU [${idx}]:`, SKU);

          const variantDoc = {
            price,
            SKU: SKU,
            original_price: originalPrice, // schema Variant hiện tại chưa có field này thì nó sẽ bị ignore (không sao)
            stock,
            image: variant.image || '',
            attributes: attrs, // array [{code,value}]
            status: variant.status || 'ACTIVE',
            product_id: newProduct._id,
          };

          console.log(`👉 Variant to insert [${idx}]:`, variantDoc);
          return variantDoc;
        });

        console.log('👉 Inserting product variants:', variantsToInsert);
        let variantInserted = [];
        for (const vPromise of variantsToInsert) {
          const vDoc = await vPromise;
          const vModel = new ProductVariantModel(vDoc);
          const savedVariant = await vModel.save();
          variantInserted.push(savedVariant);
        }
        // await ProductVariantModel.insertMany(variantsToInsert);
        console.log('✅ Variants inserted:', variantInserted.length);
        console.log('✅ Inserted variants for product:', newProduct._id);
      }

      return res.status(201).json({
        success: true,
        message: 'Tạo sản phẩm thành công',
        data: newProduct,
      });
    } catch (error) {
      // 🔥 Nhớ in log ra console để thấy lỗi thật
      console.error('❌ Lỗi trong ProductController.store:', error);

      return res.status(500).json({
        success: false,
        message: error.message || 'Lỗi server',
        data: null,
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
        message: 'Lỗi server.' + (error.message || ''),
        data: null,
        error,
      });
    }
  }

  // [PUT] /products/:id
  async update(req, res) {
    try {
      const parsedId = parseInt(req.params.id, 10);
      if (isNaN(parsedId)) {
        return res
          .status(400)
          .json({ success: false, message: 'ID không hợp lệ' });
      }

      let { specifications } = req.body;
      // Parse specifications
      try {
        specifications = Array.isArray(specifications)
          ? specifications
          : JSON.parse(specifications || '[]');
        if (Array.isArray(specifications) && specifications.length < 0) {
          return res.status(400).json({
            success: false,
            message: 'Specifications không được để trống',
          });
        }
      } catch (e) {
        console.error('❌ Lỗi JSON.parse specifications:', e);
        return res.status(400).json({
          success: false,
          message: 'Dữ liệu specifications không hợp lệ',
          data: null,
        });
      }

      const existed = await ProductModel.findById(parsedId);
      if (!existed) {
        return res
          .status(404)
          .json({ success: false, message: 'Không tìm thấy sản phẩm' });
      }

      // Log request
      console.log('Files:', req.files);
      console.log('Body:', req.body);

      // 1. Ảnh cũ từ DB
      const oldImages = existed.images || [];

      const oldThumbnail = oldImages.find((img) => img.type === 'THUMBNAIL');
      const oldOtherImages = oldImages.filter(
        (img) => img.type !== 'THUMBNAIL'
      );

      // 2. Ảnh mới từ client
      const newThumbnailFile = req.files?.thumbnail?.[0] || null;
      const newImageFiles = req.files?.images || [];

      // 3. Thumbnail - mới thì thay, không có mới thì giữ cũ
      const finalThumbnail = newThumbnailFile
        ? {
            img_url: newThumbnailFile.path,
            type: 'THUMBNAIL',
            id: oldThumbnail?.id || 1,
          }
        : oldThumbnail;

      // 4. Ảnh mô tả
      let finalImages = [...oldOtherImages];
      if (newImageFiles.length > 0) {
        const mappedNewImages = newImageFiles.map((file, idx) => ({
          img_url: file.path,
          type: 'IMAGES',
          id: Date.now() + idx,
        }));
        finalImages = [...finalImages, ...mappedNewImages];
      }

      const finalAllImages = finalThumbnail
        ? [finalThumbnail, ...finalImages]
        : finalImages;

      // 5. Update sản phẩm
      const updatedProduct = await ProductModel.findByIdAndUpdate(
        parsedId,
        {
          ...req.body,
          images: finalAllImages,
          specifications: Array.isArray(req.body.specifications)
            ? req.body.specifications
            : JSON.parse(req.body.specifications || '[]'),
        },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: `Cập nhật sản phẩm thành công`,
        data: updatedProduct,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, error });
    }
  }

  // [DELETE] api/products/:id/soft
  async softDelete(req, res, next) {
    try {
      const { id } = req.params;

      const c = await ProductModel.delete(
        { _id: parseInt(id, 10) },
        (err, result) => {
          if (err) {
            console.error('Error during soft delete:', err);
          } else {
            console.log('Soft delete result inside callback:', result);
          }
        }
      );
      console.log('Soft delete operation result:', c);
      if (c.modifiedCount === 0) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm để xóa ID = ${id}`,
        });
      }
      console.log('Soft delete result:', c);
      // await ProductModel.updateOne(
      //   { _id: parseInt(id, 10) },
      //   { status: PRODUCT_STATUSES.INACTIVE }
      // );
      return res.status(200).json({
        success: true,
        message: `Xóa sản phẩm thành công. ID = ${id}`,
        data: id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: `${error.message}. Lỗi server khi xóa sản phẩm ID = ${req.params.id}. `,
        error,
      });
      // next(error);
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
