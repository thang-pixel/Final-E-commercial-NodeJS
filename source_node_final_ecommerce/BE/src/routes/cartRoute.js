const express = require('express');
const router = express.Router();

const CartController = require('../app/controllers/CartController')

// controller 

router.get('/:user_id', CartController.getCartByUserId);
router.post('/:user_id/add', CartController.addToCart);
router.put('/:user_id/update', CartController.updateCartItem);
router.delete('/:user_id/remove', CartController.removeCartItem);
router.delete('/:user_id/clear', CartController.clearCart);

// Cart router
router.get('/', (req, res) => {
    res.status(200).json({ message: 'Cart route is working' });
})
// router.get('/:slug', CartController.show);
// router.get('/', CartController.index);
// router.post('/', CartController.store);   

module.exports = router;