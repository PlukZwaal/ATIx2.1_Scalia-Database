const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes voor authenticatie
router.get('/login', authController.getLoginForm); // Toon login formulier
router.post('/login', authController.login); // Verwerk login
router.post('/logout', authController.logout); // Uitloggen

module.exports = router;
