const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

router.get('/', actorController.getAll);
router.get('/create', actorController.getCreateForm);
router.post('/create', actorController.create);
router.get('/:id/edit', actorController.getEditForm);
router.post('/:id/edit', actorController.update);
router.get('/:id', actorController.getById);
router.post('/:id/delete', actorController.delete);


module.exports = router;