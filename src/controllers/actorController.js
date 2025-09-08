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

  getCreateForm: (req, res) => {
    res.render('actorCreate', { 
      title: 'Nieuwe Acteur Aanmaken',
      errors: [],
      formData: {}
    });
  },

  create: (req, res, next) => {
    const { first_name, last_name } = req.body;
    const errors = [];

    if (!first_name || first_name.trim().length === 0) {
      errors.push('Voornaam is verplicht');
    }
    if (!last_name || last_name.trim().length === 0) {
      errors.push('Achternaam is verplicht');
    }

    if (errors.length > 0) {
      return res.render('actorCreate', {
        title: 'Nieuwe Acteur Aanmaken',
        errors: errors,
        formData: { first_name, last_name }
      });
    }

    const actorData = {
      first_name: first_name.trim(),
      last_name: last_name.trim()
    };

    actorService.create(actorData, (err, newActor) => {
      if (err) {
        return next(err);
      }
      
      res.redirect(`/actor/${newActor.actor_id}`);
    });
  }
};

module.exports = actorController;