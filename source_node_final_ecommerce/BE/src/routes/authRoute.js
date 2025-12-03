const express = require('express');
const router = express.Router();
const AuthController = require('../app/controllers/AuthController');




router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/social', AuthController.socialLogin);
router.post('/guest', AuthController.guestLogin);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
module.exports = router;