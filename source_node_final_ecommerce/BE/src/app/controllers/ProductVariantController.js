const ProductModel = require('../models/ProductModel');
const ProductVariant = require('../models/ProductVariant');

class ProductVariantController {
  // [GET] /products/:productId/variants
  async getVariantsByProductId(req, res, next) {
    const { productId } = req.params;
    const parsedProductId = parseInt(productId, 10);

    try {
      const variants = await ProductVariant.find({
        product_id: parsedProductId,
      });
      res.status(200).json({
        success: true,
        message: 'Product variants retrieved successfully',
        data: variants,
      });
    } catch (error) {
      // next(error);
      console.error('Error retrieving product variants:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving product variants',
        error: error.message,
      });
    }
  }

  // [POST] /products/:productId/variants
  async createVariant(req, res, next) {
    const { productId } = req.params;
    const parsedProductId = parseInt(productId, 10);
    const { SKU, attributes, price, original_price, stock } = req.body;

    if (!attributes || !price || !original_price || stock == null) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết để tạo biến thể sản phẩm',
      });
    }

    const existProduct = await ProductModel.findOne({ _id: parsedProductId });
    if (!existProduct) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại',
      });
    }

    const existVariant = await ProductVariant.findOne({
      product_id: parsedProductId,
      SKU,
    });

    console.log('👉 Exist variant check:', existVariant);
    if (existVariant) {
      return res.status(409).json({
        success: false,
        message: 'Biến thể sản phẩm với SKU đã tồn tại',
      });
    }

    try {
      const newVariant = await ProductVariant.create({
        product_id: parsedProductId,
        attributes,
        SKU,
        price,
        original_price,
        stock: stock,
      });

      const minPrice = Math.min(existProduct.min_price || 0, price);
      const maxPrice = Math.max(existProduct.max_price || 0, price);
      // Cập nhật lại giá min/max cho sản phẩm
      await ProductModel.findOneAndUpdate(
        { _id: parsedProductId },
        { min_price: minPrice, max_price: maxPrice }
      );

      res.status(201).json({
        success: true,
        message: 'Biến thể sản phẩm đã được tạo thành công',
        data: newVariant,
      });
    } catch (error) {
      // next(error);
      console.error('Error creating product variant:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo biến thể sản phẩm',
        error: error.message,
      });
    }
  }

  // [PUT] /products/:productId/variants/:variantId
  async updateVariant(req, res, next) {
    const { productId, variantId } = req.params;
    const parsedProductId = parseInt(productId, 10);
    const parsedVariantId = parseInt(variantId, 10);

    const { SKU, attributes, price, original_price, stock, status } =
      req.body;

    if (
      !attributes ||
      price == null ||
      original_price == null ||
      stock == null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết để cập nhật biến thể sản phẩm',
      });
    }     //

    try {
      const existVariant = await ProductVariant.findOne({
        product_id: parsedProductId,
        _id: parsedVariantId,
      });

      if (!existVariant) {
        return res.status(404).json({
          success: false,
          message: 'Biến thể sản phẩm không tồn tại',
        });
      }

      // check SKU uniqueness
      const skuConflictVariant = await ProductVariant.findOne({
        product_id: parsedProductId,
        SKU,
        _id: { $ne: parsedVariantId },
      });

      if (skuConflictVariant) {
        return res.status(409).json({
          success: false,
          message: 'Biến thể sản phẩm với SKU đã tồn tại',
        });
      }

      const existProduct = await ProductModel.findOne({ _id: parsedProductId });  
      const minPrice = Math.min(existProduct.min_price || 0, price);
      const maxPrice = Math.max(existProduct.max_price || 0, price);
      // Cập nhật lại giá min/max cho sản phẩm
      await ProductModel.findOneAndUpdate(
        { _id: parsedProductId },
        { min_price: minPrice, max_price: maxPrice }
      );

      console.log('👉 Product exist:', existProduct);

      const updatedVariant = await ProductVariant.findOneAndUpdate(
        { product_id: parsedProductId, _id: parsedVariantId },
        {
          attributes,
          SKU,
          price,
          original_price,
          stock: stock,
          status,
        },
        { new: true }
      );

      console.log('👉 Updated variant:', updatedVariant);

      if (!updatedVariant) {
        return res.status(404).json({
          success: false,
          message: 'Biến thể sản phẩm không tìm thấy',
        });
      }
      res.status(200).json({
        success: true,
        message: 'Biến thể sản phẩm cập nhật thành công',
        data: updatedVariant,
      });
    } catch (error) {
      // next(error);
      console.error('Error updating product variant:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật biến thể sản phẩm',
        error: error.message,
      });
    }
  }

  // [PATCH] /products/:productId/variants/:variantId/status
  async updateVariantStatus(req, res, next) {
    const { productId, variantId } = req.params;
    const parsedProductId = parseInt(productId, 10);
    const parsedVariantId = parseInt(variantId, 10);
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái biến thể sản phẩm không hợp lệ',
      });
    }
    try {
      const updatedVariant = await ProductVariant.findOneAndUpdate(
        { product_id: parsedProductId, _id: parsedVariantId },
        { status },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: 'Trạng thái biến thể sản phẩm đã được cập nhật thành công',
        data: updatedVariant,
      });
    } catch (error) {
      // next(error);
      console.error('Error updating variant status:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái biến thể sản phẩm',
        error: error.message,
      });
    }
  }

  // [DELETE] /products/:productId/variants/:variantId
  async deleteVariant(req, res, next) {
    const { productId, variantId } = req.params;
    const parsedProductId = parseInt(productId, 10);
    const parsedVariantId = parseInt(variantId, 10);
    try {
      // check tôn tại trong order items trước khi xóa


      // xóa
      const deletedVariant = await ProductVariant.delete({
        product_id: parsedProductId,
        _id: parsedVariantId,
      });

      console.log('👉 Deleted variant result:', deletedVariant);
      if (!deletedVariant) {
        return res.status(404).json({
          success: false,
          message: 'Biến thể sản phẩm không tìm thấy',
        });
      }
      res.status(200).json({
        success: true,
        message: 'Biến thể sản phẩm đã được xóa thành công',
        data: deletedVariant,
      });
    } catch (error) {
      // next(error);
      console.error('Error deleting product variant:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa biến thể sản phẩm',
        error: error.message,
      });
    }
  }
}

module.exports = new ProductVariantController();
