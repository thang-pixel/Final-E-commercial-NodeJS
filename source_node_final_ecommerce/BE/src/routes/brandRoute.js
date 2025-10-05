const express = require('express');
const router = express.Router();

// controller
// const BrandController = require('../app/controllers/BrandController');

// Brand router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Brand route is working' });
})
// router.get('/:slug', BrandController.show);
// router.get('/', BrandController.index);
// router.post('/', BrandController.store);   

module.exports = router;