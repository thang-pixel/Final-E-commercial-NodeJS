const express = require('express');
const router = express.Router();

// controller
const homeController = require('../app/controllers/HomeController');

// Home router
router.get('/', homeController.index);

module.exports = router;