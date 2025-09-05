const express = require('express');
const path = require('path');
require('dotenv').config();

const homeRoutes = require('./src/routes/home');
const actorRouter = require('./src/routes/actor')
const { logger } = require('./src/util/logger');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRoutes);
app.use('/actor', actorRouter);

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
});
