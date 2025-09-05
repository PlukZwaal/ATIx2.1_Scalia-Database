const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAll);
router.get('/:id', staffController.getById);

module.exports = router;
