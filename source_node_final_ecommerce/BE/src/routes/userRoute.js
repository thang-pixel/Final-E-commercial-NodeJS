const express = require('express');
const router = express.Router();

// controller
const UserController = require('../app/controllers/UserController');


// User router
router.get('/:username/edit', UserController.edit);
router.put('/:username', UserController.update);
router.patch('/:username/change-password', UserController.changePassword);
router.get('/', UserController.index);
router.post('/', UserController.store);

module.exports = router;