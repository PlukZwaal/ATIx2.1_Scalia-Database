const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
require('dotenv').config();

// Middleware om te controleren of gebruiker ingelogd is
const requireAuth = (req, res, next) => {
  const token = req.cookies.auth_token;

  // Geen token? Doorsturen naar login
  if (!token) {
    return res.redirect('/auth/login');
  }

  // Verifieer JWT token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie('auth_token');
      return res.redirect('/auth/login');
    }

    // Haal gebruiker op uit database
    authService.getById(decoded.staff_id, (err, user) => {
      if (err || !user) {
        res.clearCookie('auth_token');
        return res.redirect('/auth/login');
      }

      req.user = user; // Voeg gebruiker toe aan request
      next();
    });
  });
};

module.exports = { requireAuth };
