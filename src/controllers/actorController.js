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
        const error = new Error('Acteur niet gevonden');
        error.status = 404;
        return next(error);
      }
      
      actorService.getFilmsByActorId(actorId, (err, films) => {
        if (err) {
          console.error('Error fetching films for actor:', err);
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