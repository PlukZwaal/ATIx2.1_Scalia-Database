const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAll);

router.get('/create', staffController.showCreateForm);
router.post('/create', staffController.create);

router.get('/:id', staffController.getById);

module.exports = router;
