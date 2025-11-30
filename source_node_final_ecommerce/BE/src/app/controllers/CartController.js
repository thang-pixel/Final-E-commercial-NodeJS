const CartModel = require("../models/CartModel");
const ProductVariant = require("../models/ProductVariant");

class CartController {
  // [GET] api/carts/:user_id
  async getCartByUserId(req, res) {
    const { user_id } = req.params;
    const userIdParsed = parseInt(user_id, 10);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ message: 'Sai user_id: ' + user_id });
    }

    try {
      // Find cart by user_id logic here
      const cart = await CartModel.findOne({ customer_id: userIdParsed });
      if (!cart) {
        return res
          .status(404)
          .json({ message: 'Cart không tìm thấy với user_id: ' + user_id });
      }

      return res.status(200).json({ message: 'Cart found', data:cart });
    } catch (error) {
      console.error('Error fetching cart:', error);
      return res.status(500).json({ message: 'Lỗi server khi lấy cart: ' + error.message });
    }
  }

  // [POST] api/carts/:user_id/add
  async addToCart(req, res) {
    const { user_id } = req.params;
    const userIdParsed = parseInt(user_id, 10);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ message: 'Sai user_id: ' + user_id });
    }

    try {
      const { product_id, variant_id, SKU, name, image_url, attributes, price, quantity } = req.body;
      // Add to cart logic here
      let cart = await CartModel.findOne({ customer_id: userIdParsed });
      if (!cart) {
        cart = new CartModel({ customer_id: userIdParsed, items: [] });
      }

      // check stock
      const variant = await ProductVariant.findOne({ _id: variant_id, product_id: product_id });
      if (!variant) {
        return res.status(404).json({ message: 'Variant không tìm thấy với variant_id: ' + variant_id });
      }
      if (quantity > variant.stock) {
        return res.status(400).json({ message: `Số lượng vượt quá tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) => item.variant_id === variant_id
      );

      if (existingItemIndex >= 0) {
        const oldQuantity = cart.items[existingItemIndex].quantity;
        if (oldQuantity + quantity > variant.stock) {
          return res.status(400).json({ message: `Số lượng vượt quá tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
        }
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += quantity;
      }
      else {
        // Add new item to cart
        cart.items.push({
          product_id,
          variant_id,
          SKU,
          name,
          image_url,
          attributes,
          price,
          quantity
        });
      }

      await cart.save();
      return res.status(200).json({ message: 'Item đã được thêm vào giỏ hàng', data:cart });
    } catch (error) {
      console.error('Error adding to cart:', error);
      return res.status(500).json({ message: 'Lỗi server khi thêm vào cart: ' + error.message });
    }
  }

  // [PUT] api/carts/:user_id/update
  async updateCartItem(req, res) {
    const { user_id } = req.params;
    const userIdParsed = parseInt(user_id, 10);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ message: 'Sai user_id: ' + user_id });
    }

    try {
      const { product_id, variant_id, quantity } = req.body;
      // Update cart item logic here
      const cart = await CartModel.findOne({ customer_id: userIdParsed });
      if (!cart) {
        return res
          .status(404)
          .json({ message: 'Cart không tìm thấy với user_id: ' + user_id });
      }

      // check stock
      const variant = await ProductVariant.findOne({ _id: variant_id, product_id: product_id });
      if (!variant) {
        return res.status(404).json({ message: 'Variant không tìm thấy với variant_id: ' + variant_id });
      }
      if (quantity > variant.stock) {
        return res.status(400).json({ message: `Số lượng vượt quá tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
      }


      const itemIndex = cart.items.findIndex(
        (item) => item.variant_id === variant_id
      );
      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ message: 'Item không tìm thấy trong cart với variant_id: ' + variant_id });
      } else {
        const oldQuantity = cart.items[itemIndex].quantity;
        if (quantity > variant.stock) {
          return res.status(400).json({ message: `Số lượng vượt quá tồn kho. Chỉ còn ${variant.stock} sản phẩm.` });
        }
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
      return res.status(200).json({ message: 'Cart item updated', data:cart });
    } catch (error) {
      console.error('Error updating cart item:', error);
      return res.status(500).json({ message: 'ỗi server khi cập nhật cart: ' + error.message });
    }

  }

  // [DELETE] api/carts/:user_id/remove
  async removeCartItem(req, res) {
    const { user_id } = req.params;
    const userIdParsed = parseInt(user_id, 10);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ message: 'Sai user_id: ' + user_id });
    }
    try {
      const { product_id, variant_id } = req.body;
      // Remove cart item logic here
      const cart = await CartModel.findOne({ customer_id: userIdParsed });
      if (!cart) {
        return res
          .status(404)
          .json({ message: 'Cart không tìm thấy với user_id: ' + user_id });
      }
      const itemIndex = cart.items.findIndex(
        (item) => item.variant_id === variant_id
      );
      if (itemIndex === -1) {
        return res
          .status(404)
          .json({ message: 'Item không tìm thấy trong cart với variant_id: ' + variant_id });
      }
      cart.items.splice(itemIndex, 1);
      await cart.save();
      return res.status(200).json({ message: 'Item trong cart đã được xóa', data:cart });
    } catch (error) {
      console.error('Error removing cart item:', error);
      return res.status(500).json({ message: 'ỗi server khi xóa item khỏi cart: ' + error.message });
    }
  }

  // [DELETE] api/carts/:user_id/clear
  async clearCart(req, res) {
    const { user_id } = req.params;
    const userIdParsed = parseInt(user_id, 10);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ message: 'Sai user_id: ' + user_id });
    }
    try {
      // Clear cart logic here
      const cart = await CartModel.findOne({ customer_id: userIdParsed });
      if (!cart) {
        return res
          .status(404)
          .json({ message: 'Cart không tìm thấy với user_id: ' + user_id });
      }
      cart.items = [];
      await cart.save();
      return res.status(200).json({ message: 'Cart đã được xóa', cart });
    } catch (error) {
      console.error('Error clearing cart:', error);
      return res.status(500).json({ message: 'Lỗi server khi xóa cart: ' + error.message });
    }
  }
}

module.exports = new CartController();