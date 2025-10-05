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
  body('category').trim().notEmpty().withMessage('Danh mục sản phẩm không được trống'),
];

const orderRules = [
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

module.exports = {
    registerRules,
    productRules,
    orderRules,
}