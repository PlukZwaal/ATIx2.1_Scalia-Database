const actorService = require('../services/actorService');

const actorController = {
  getAll: (req, res, next) => {
    actorService.getAll((err, actor) => {
      if (err) {
        return next(err);
      }
      res.render('actor', { title: 'Actor', actor });
    });
  },
  
  getById: (req, res, next) => {
    const actorId = Number(req.params.id);
    
    actorService.getById(actorId, (err, actor) => {
      if (err) {
        return next(err);
      }
      if (!actor) {
        return res.status(404).send('Actor not found');
      }
      
      // Haal ook de films op waarin deze acteur speelt
      actorService.getFilmsByActorId(actorId, (err, films) => {
        if (err) {
          console.error('Error fetching films for actor:', err);
          // Als er een fout is bij films, render dan alsnog maar met lege films array
          films = [];
        }
        
        res.render('actorDetail', { 
          title: `Details van ${actor.full_name}`, 
          actor: actor,
          films: films || []
        });
      });
    });
  },
};

module.exports = actorController;