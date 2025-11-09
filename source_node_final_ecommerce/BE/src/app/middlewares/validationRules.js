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

  body('category_id')
    .isInt({ gt: 0 })
    .withMessage('Mã danh mục không hợp lệ'),

  body('brand_id')
    .isInt({ gt: 0 })
    .withMessage('Mã thương hiệu không hợp lệ'),

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

  // body('images.*.img_url')
  //   .trim()
  //   .notEmpty()
  //   .withMessage('URL ảnh không được trống'),

  // body('images.*.type')
  //   .isIn(['THUMBNAIL', 'IMAGES'])
  //   .withMessage('Loại ảnh không hợp lệ'),

  // 🧩 Biến thể sản phẩm
  body('variants')
    .isArray()
    .withMessage('Danh sách biến thể phải là mảng')
    .custom((arr) => {
      if (!Array.isArray(arr) || arr.length < 2) {
        throw new Error('Cần ít nhất 2 biến thể sản phẩm');
      }
      return true;
    }),

  body('variants.*.color')
    .trim()
    .notEmpty()
    .withMessage('Màu sắc biến thể không được trống'),

  body('variants.*.storage')
    .trim()
    .notEmpty()
    .withMessage('Dung lượng biến thể không được trống'),

  body('variants.*.price')
    .isFloat({ min: 0 })
    .withMessage('Giá bán biến thể phải lớn hơn hoặc bằng 0'),

  body('variants.*.original_price')
    .isFloat({ min: 0 })
    .withMessage('Giá gốc biến thể phải lớn hơn hoặc bằng 0'),
];

const orderRules = [
  body('productId').isInt().withMessage('Mã sản phẩm không hợp lệ'),
  body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
];

module.exports = {
  registerRules,
  productRules,
  orderRules,
};
