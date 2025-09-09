const jwt = require('jsonwebtoken');
const authService = require('../services/authService');
require('dotenv').config();

const requireAuth = (req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    return res.redirect('/auth/login');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie('auth_token');
      return res.redirect('/auth/login');
    }

    authService.getById(decoded.staff_id, (err, user) => {
      if (err || !user) {
        res.clearCookie('auth_token');
        return res.redirect('/auth/login');
      }

      req.user = user;
      next();
    });
  });
};

module.exports = { requireAuth };