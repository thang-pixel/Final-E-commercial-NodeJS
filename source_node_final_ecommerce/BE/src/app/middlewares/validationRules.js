const { body } = require('express-validator');

const registerRules = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('fullname').trim().notEmpty().withMessage('Họ tên không được trống'),
  body('age').isInt({ min: 0, max: 100 }).withMessage('Tuổi không hợp lệ'),
  body('gender').isIn(['male', 'female']).withMessage('Giới tính không hợp lệ'),
];

const productRules = [
  // 🧱 Thông tin cơ bản
  body('name').trim().notEmpty().withMessage('Tên sản phẩm không được trống'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Mô tả sản phẩm không được trống'),

  body('category_id').isInt({ gt: 0 }).withMessage('Mã danh mục không hợp lệ'),

  body('brand_id').isInt({ gt: 0 }).withMessage('Mã thương hiệu không hợp lệ'),

  body('status')
    .isIn(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK'])
    .withMessage('Trạng thái sản phẩm không hợp lệ'),

  body('specifications').custom((value) => {
    try {
      const specs = JSON.parse(value);
      if (!Array.isArray(specs) || specs.length === 0) {
        throw new Error('Thông số kỹ thuật phải là mảng và không được trống');
      }
      return true;
    } catch (error) {
      throw new Error('Thông số kỹ thuật không hợp lệ');
    }
  }),

  // 🖼️ Ảnh sản phẩm
  // body('images')
  //   .isArray()
  //   .withMessage('Danh sách ảnh phải là mảng')
  //   .custom((arr) => {
  //     if (!Array.isArray(arr) || arr.length < 3) {
  //       throw new Error('Cần ít nhất 3 ảnh sản phẩm');
  //     }
  //     return true;
  //   }),

  // 🧩 Biến thể sản phẩm
];

const productImageRules = [
  // ===============================
  // 🔥 Thumbnail validation
  // ===============================
  body('thumbnail').custom((value, { req }) => {
    const thumbnail = req.files?.thumbnail?.[0];
    if (thumbnail) {
      if (!thumbnail.mimetype.startsWith('image/')) {
        throw new Error('Thumbnail phải là file hình ảnh');
      }
    }
    return true;
  }),

  // ===============================
  // 🔥 Images validation
  // ===============================
  body('images').custom((value, { req }) => {
    const images = req.files?.images || [];

    // Tối thiểu 3 ảnh (nếu bạn muốn)
    if (images.length < 3) {
      throw new Error('Cần ít nhất 3 ảnh mô tả sản phẩm');
    }

    for (const img of images) {
      if (!img.mimetype.startsWith('image/')) {
        throw new Error('Tất cả file images phải là file hình ảnh');
      }
    }

    return true;
  }),
];

const productVariantRules = [
  body('variants').custom((val) => {
    try {
      const variants = JSON.parse(val);
      if (!Array.isArray(variants) || variants.length === 0) {
        throw new Error('Biến thể sản phẩm phải là mảng và không được trống');
      }
      // check price and original_price for each variant
      for (const v of variants) {
        if (typeof v.price !== 'number' || v.price < 0) {
          throw new Error('Giá bán biến thể phải là số và lớn hơn hoặc bằng 0');
        }
        if (typeof v.original_price !== 'number' || v.original_price < 0) {
          throw new Error('Giá gốc biến thể phải là số và lớn hơn hoặc bằng 0');
        }

        console.log('Variant to validate: ', v);

        if (v.price < v.original_price) {
          throw new Error('Giá bán không được nhỏ hơn giá gốc');
        }
      }
    } catch (error) {
      throw new Error('Biến thể sản phẩm không hợp lệ.' + error.message);
    }
    return true;
  }),
];

// validate 1 variant khi tạo hoặc cập nhật
const variantRules = [
  body('SKU').trim().notEmpty().withMessage('SKU không được trống'),
  body('attributes').custom((value) => {
    try { 
      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('Thuộc tính biến thể phải là mảng và không được trống');
      }
      return true;
    } catch (error) {
      throw new Error('Thuộc tính biến thể không hợp lệ');
    }
  }),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Giá bán phải là số và lớn hơn hoặc bằng 0'),
  body('original_price')
    .isFloat({ min: 0 })
    .withMessage('Giá gốc phải là số và lớn hơn hoặc bằng 0'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Số lượng tồn kho phải là số nguyên và lớn hơn hoặc bằng 0'),
];

const orderRules = [
  body('productId').isInt().withMessage('Mã sản phẩm không hợp lệ'),
  body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
];

module.exports = {
  registerRules,
  productRules,
  productImageRules,
  productVariantRules,
  variantRules,
  orderRules,
};
