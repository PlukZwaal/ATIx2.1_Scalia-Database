const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

router.get('/', actorController.getAll);
router.get('/create', actorController.getCreateForm);
router.post('/create', actorController.create);
router.get('/:id/edit', actorController.getEditForm);
router.post('/:id/edit', actorController.update);
router.post('/:id/add-film', actorController.addToFilm);
router.post('/:id/remove-film', actorController.removeFromFilm);
router.get('/:id', actorController.getById);
router.post('/:id/delete', actorController.delete);

module.exports = router;