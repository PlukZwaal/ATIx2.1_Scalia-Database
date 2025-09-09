// src/controllers/authController.js
const authMiddleware = require('../middleware/auth');
const { logger } = require('../util/logger');
require('dotenv').config();

const STAFF_PASSWORD = process.env.STAFF_PASSWORD;
const STAFF_USERNAME = process.env.STAFF_USERNAME;

const authController = {
  // Toon login formulier
  getLogin: (req, res) => {
    res.render('auth/login', {
      title: 'Inloggen',
      error: null
    });
  },

  // Verwerk login
  postLogin: (req, res, next) => {
    const { username, password } = req.body;
    
    try {
      // Validatie
      if (!username || !password) {
        return res.render('auth/login', {
          title: 'Inloggen',
          error: 'Gebruikersnaam en wachtwoord zijn verplicht'
        });
      }

      // Check credentials (in productie zou dit uit een database komen)
      if (username !== STAFF_USERNAME || password !== STAFF_PASSWORD) {
        logger.warn(`Mislukte inlogpoging voor gebruiker: ${username}`);
        return res.render('auth/login', {
          title: 'Inloggen',
          error: 'Ongeldige gebruikersnaam of wachtwoord'
        });
      }

      // Genereer JWT token
      const payload = {
        username: username,
        role: 'staff',
        loginTime: Date.now()
      };

      const token = authMiddleware.generateToken(payload);
      
      // Set cookie met token (httpOnly voor beveiliging)
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 uur in milliseconden
      });

      logger.info(`Gebruiker ${username} succesvol ingelogd`);
      res.redirect('/');
      
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  },

  // Verwerk logout
  logout: (req, res) => {
    const username = req.user?.username || 'onbekend';
    
    res.clearCookie('authToken');
    logger.info(`Gebruiker ${username} uitgelogd`);
    
    res.redirect('/auth/login?message=Je bent succesvol uitgelogd');
  },

  // Check auth status (voor AJAX calls)
  checkAuth: (req, res) => {
    try {
      const token = req.cookies?.authToken;
      
      if (!token) {
        return res.json({ authenticated: false });
      }

      const decoded = authMiddleware.verifyToken(token);
      res.json({
        authenticated: true,
        user: {
          username: decoded.username,
          role: decoded.role
        }
      });
    } catch (error) {
      res.json({ authenticated: false });
    }
  }
};

module.exports = authController;