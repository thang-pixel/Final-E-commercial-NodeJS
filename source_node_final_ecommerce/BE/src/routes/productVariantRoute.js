const express = require('express');
const { adminRequired } = require('../app/middlewares/AuthMiddleware.js');
const { productRules, productImageRules, productVariantRules, variantRules } = require('../app/middlewares/validationRules.js');
const handleValidation = require('../app/middlewares/handleValidation.js');
const router = express.Router();

const ProductVariantController = require('../app/controllers/ProductVariantController.js');

// Product Variant router
router.post(
  '/products/:productId/variants',
  adminRequired,
  variantRules,
  handleValidation,
  ProductVariantController.createVariant
);

router.get(
  '/products/:productId/variants',
  ProductVariantController.getVariantsByProductId
);

router.patch(
  '/products/:productId/variants/:variantId/status',
  adminRequired, 
  ProductVariantController.updateVariantStatus
);

router.put(
  '/products/:productId/variants/:variantId', 
  adminRequired,
  variantRules,
  handleValidation,
  ProductVariantController.updateVariant
);



router.delete(
  '/products/:productId/variants/:variantId',
  adminRequired,
  ProductVariantController.deleteVariant
);

// export the router
module.exports = router;