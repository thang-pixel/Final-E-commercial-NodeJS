const express = require('express');
const router = express.Router();

// controller
const adminHomeController = require('../app/controllers/AdminHomeController');

// Home router 
// get số lượng products, customers, orders, doanh thu

// thống kê đơn hàng theo trạng thái

// thống kê doanh thu theo ngày, tháng, năm

// thống kê sản phẩm bán chạy, tồn kho  
router.get('/', adminHomeController.index);

module.exports = router;