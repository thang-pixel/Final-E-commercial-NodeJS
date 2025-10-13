const { body } = require("express-validator");

const registerRules = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('fullname').trim().notEmpty().withMessage('Họ tên không được trống'), 
  body('age').isInt({ min: 0, max: 100 }).withMessage('Tuổi không hợp lệ'),
  body('gender').isIn(['male', 'female']).withMessage('Giới tính không hợp lệ'), 
];

const productRules = [
  body('name').trim().notEmpty().withMessage('Tên sản phẩm không được trống'),
  body('price').isFloat({ min: 0 }).withMessage('Giá sản phẩm không hợp lệ'),
  body('description').trim().notEmpty().withMessage('Mô tả sản phẩm không được trống'),
  body('category_id').isInt().withMessage('Mã danh mục không hợp lệ'),
  body('brand_id').isInt().withMessage('Mã thương hiệu không hợp lệ'),
  body('images').isArray().length({ min: 3 }).withMessage('Cần ít nhất 3 ảnh sản phẩm'),
  body('variants').isArray({ min: 2 }).withMessage('Cần ít nhất 2 biến thể sản phẩm'),
  body('variants.*.color').trim().notEmpty().withMessage('Màu sắc biến thể không được trống'),
  body('variants.*.storage').trim().notEmpty().withMessage('Dung lượng biến thể không được trống'),
  body('variants.*.price').isFloat({ min: 0 }).withMessage('Giá biến thể không hợp lệ'),
  body('variants.*.original_price').isFloat({ min: 0 }).withMessage('Giá gốc biến thể không hợp lệ'),
  body('images.*.img_url').trim().withMessage('URL ảnh không hợp lệ'),
  body('images.*.type').isIn(['THUMBNAIL', 'IMAGES']).withMessage('Loại ảnh không hợp lệ'),
];

const orderRules = [
  body('productId').isInt().withMessage('Mã sản phẩm không hợp lệ'),
  body('quantity').isInt({ min: 1 }).withMessage('Số lượng phải lớn hơn 0'),
];

module.exports = {
    registerRules,
    productRules,
    orderRules,
}