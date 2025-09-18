// Importeer alle benodigde modules
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Importeer route bestanden
const homeRoutes = require('./src/routes/home');
const actorRouter = require('./src/routes/actor');
const aboutRoutes = require('./src/routes/about');
const authRoutes = require('./src/routes/auth');

// Importeer middleware
const { requireAuth } = require('./src/middleware/authMiddleware');
const { logger } = require('./src/util/logger');

// Maak Express app aan
const app = express();
const PORT = process.env.PORT || 3000;

// Configureer EJS als template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware voor request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Definieer routes
app.use('/auth', authRoutes);
app.use('/', requireAuth, homeRoutes); 
app.use('/about', requireAuth, aboutRoutes); 
app.use('/actor', requireAuth, actorRouter); 

// Error handling middleware
app.use((err, req, res, next) => {
  const error = {
    status: err.status || 500,
    message: err.message || 'Er is een onbekende fout opgetreden'
  };
  
  logger.error(`Error ${error.status}: ${error.message}`);
  
  res.status(error.status).render('error', { 
    title: 'Fout', 
    error: error 
  });
});

// 404 handler voor niet-gevonden pagina's
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Pagina niet gevonden', 
    error: { 
      status: 404, 
      message: 'De opgevraagde pagina bestaat niet.' 
    } 
  });
});

// Start de server
app.listen(25060, () => {
  logger.info(`Server is live op http://localhost:${25060}`); 
});