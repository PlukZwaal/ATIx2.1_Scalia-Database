const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

// Overzicht
router.get('/', staffController.getAll);

// Detailpagina voor 1 medewerker
router.get('/:id', staffController.getById);

module.exports = router;
