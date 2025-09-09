const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const homeRoutes = require('./src/routes/home');
const actorRouter = require('./src/routes/actor');
const authRoutes = require('./src/routes/auth');
const { logger } = require('./src/util/logger');
const { requireAuth } = require('./src/middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoutes);
app.use('/', requireAuth, homeRoutes); 
app.use('/actor', requireAuth, actorRouter); 

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

app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Pagina niet gevonden', 
    error: { 
      status: 404, 
      message: 'De opgevraagde pagina bestaat niet.' 
    } 
  });
});

app.listen(PORT, () => {
  logger.info(`Server is live op http://localhost:${PORT}`);
  logger.info('JWT authenticatie is actief - alle routes zijn beschermd');
});