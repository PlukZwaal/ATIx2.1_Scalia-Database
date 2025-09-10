const express = require('express');
const router = express.Router();
const actorController = require('../controllers/actorController');

// Routes voor acteurs
router.get('/', actorController.getAll); // Alle acteurs tonen
router.get('/create', actorController.getCreateForm); // Formulier voor nieuwe acteur
router.post('/create', actorController.create); // Nieuwe acteur aanmaken
router.get('/:id/edit', actorController.getEditForm); // Formulier om acteur te bewerken
router.post('/:id/edit', actorController.update); // Acteur bijwerken
router.post('/:id/add-film', actorController.addToFilm); // Acteur koppelen aan film
router.post('/:id/remove-film', actorController.removeFromFilm); // Acteur van film ontkoppelen
router.get('/:id', actorController.getById); // Details van acteur tonen
router.post('/:id/delete', actorController.delete); // Acteur verwijderen

module.exports = router;
