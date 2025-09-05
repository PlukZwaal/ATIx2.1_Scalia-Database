const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

router.get('/', actorController.getAll);
router.get('/:id', actorController.getById);

module.exports = router;