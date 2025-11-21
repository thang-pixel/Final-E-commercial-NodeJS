const express = require('express');
const ProductController = require('../app/controllers/ProductController.js');
const upload = require('../config/multer/multerConfig.js');
const { adminRequired } = require('../app/middlewares/AuthMiddleware.js');
const { productRules } = require('../app/middlewares/validationRules.js');
const router = express.Router();

// controller
// const ProductController = require('../app/controllers/ProductController');

// Product router


router.get('/search', ProductController.search);
router.get('/:slug', ProductController.show);
router.get('/:id/detail', adminRequired, ProductController.detail);
router.get('/', ProductController.index);
router.post('/:id/restore', adminRequired, ProductController.restore);
router.post('/', adminRequired, productRules, upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'thumbnail', maxCount: 1 }
]), ProductController.store);
router.patch('/:id/change-status', adminRequired, ProductController.changeStatus);
router.put('/:id', adminRequired, ProductController.update);
// router.delete('/:id/force', adminRequired, ProductController.destroy);
router.delete('/:id', adminRequired, ProductController.softDelete);
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Product route is working' });
})
module.exports = router;