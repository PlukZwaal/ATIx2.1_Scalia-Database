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

app.listen(PORT, () => {
  logger.info(`Server is live op http://localhost:${PORT}`);
});
