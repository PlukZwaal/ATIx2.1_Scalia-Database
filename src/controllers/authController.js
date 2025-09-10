const authService = require('../services/authService');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authController = {
  // Toon login formulier
  getLoginForm: (req, res) => {
    res.render('auth/login', {
      title: 'Inloggen',
      error: null,
      formData: {}
    });
  },

  // Verwerk login
  login: (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    // Validatie velden
    if (!email || email.trim().length === 0) {
      errors.push('Email is verplicht');
    }
    if (!password || password.trim().length === 0) {
      errors.push('Wachtwoord is verplicht');
    }

    if (errors.length > 0) {
      return res.render('auth/login', {
        title: 'Inloggen',
        error: errors[0],
        formData: { email }
      });
    }

    // Controleer gebruiker
    authService.authenticate(email.trim(), password, (err, user) => {
      if (err) {
        return res.render('auth/login', {
          title: 'Inloggen',
          error: err.message,
          formData: { email }
        });
      }

      // Maak JWT token aan
      const token = jwt.sign(
        { 
          staff_id: user.staff_id,
          email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Zet token in cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: false, // zou true moeten zijn in productie
        maxAge: 24 * 60 * 60 * 1000
      });

      res.redirect('/actor');
    });
  },

  // Uitloggen (cookie verwijderen)
  logout: (req, res) => {
    res.clearCookie('auth_token');
    res.redirect('/auth/login');
  }
};

module.exports = authController;
