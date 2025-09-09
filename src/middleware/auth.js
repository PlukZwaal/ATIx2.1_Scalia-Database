const jwt = require('jsonwebtoken');
const { logger } = require('../util/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const authMiddleware = {
  requireAuth: (req, res, next) => {
    try {
      const token = req.cookies?.authToken;
      
      if (!token) {
        logger.warn('Toegang geweigerd: Geen token gevonden');
        return res.redirect('/auth/login');
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      logger.debug(`Gebruiker geauthenticeerd: ${decoded.username}`);
      next();
    } catch (error) {
      logger.error('Token verificatie gefaald:', error.message);
      res.clearCookie('authToken');
      return res.redirect('/auth/login');
    }
  },

  redirectIfAuthenticated: (req, res, next) => {
    try {
      const token = req.cookies?.authToken;
      
      if (token) {
        jwt.verify(token, JWT_SECRET);
        logger.debug('Gebruiker al ingelogd, redirect naar dashboard');
        return res.redirect('/');
      }
      next();
    } catch (error) {
      res.clearCookie('authToken');
      next();
    }
  },

  generateToken: (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  },

  verifyToken: (token) => {
    return jwt.verify(token, JWT_SECRET);
  }
};

module.exports = authMiddleware;