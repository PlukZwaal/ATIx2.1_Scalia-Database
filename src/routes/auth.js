const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfAuthenticated } = require('../middleware/auth');

router.get('/login', redirectIfAuthenticated, authController.getLogin);

router.post('/login', redirectIfAuthenticated, authController.postLogin);

router.post('/logout', authController.logout);

router.get('/check', authController.checkAuth);

module.exports = router;