// var express = require('express');
// var router = express.Router();

// const usersController = require('../controllers/users');

// router.get('/', usersController.get);

// module.exports = router;

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

module.exports = router;