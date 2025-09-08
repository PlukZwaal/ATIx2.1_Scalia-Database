const actorService = require('../services/actorService');
require('dotenv').config();

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

    // Validatie
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
  },

  getEditForm: (req, res, next) => {
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

      res.render('actorEdit', {
        title: `${actor.full_name} Bewerken`,
        actor: actor,
        errors: [],
        formData: {
          first_name: actor.first_name,
          last_name: actor.last_name
        }
      });
    });
  },

  update: (req, res, next) => {
    const actorId = Number(req.params.id);
    const { first_name, last_name } = req.body;
    const errors = [];

    if (!first_name || first_name.trim().length === 0) {
      errors.push('Voornaam is verplicht');
    }
    if (!last_name || last_name.trim().length === 0) {
      errors.push('Achternaam is verplicht');
    }

    if (errors.length > 0) {
      return actorService.getById(actorId, (err, actor) => {
        if (err) return next(err);
        if (!actor) {
          const error = new Error('Acteur niet gevonden');
          error.status = 404;
          return next(error);
        }

        res.render('actorEdit', {
          title: `${actor.full_name} Bewerken`,
          actor: actor,
          errors: errors,
          formData: { first_name, last_name }
        });
      });
    }

    const actorData = {
      first_name: first_name.trim(),
      last_name: last_name.trim()
    };

    actorService.update(actorId, actorData, (err, updatedActor) => {
      if (err) {
        return next(err);
      }

      res.redirect(`/actor/${actorId}`);
    });
  },

delete: (req, res, next) => {
  const actorId = Number(req.params.id);
  const { password } = req.body;

  if (password !== process.env.STAFF_PASSWORD) {
    const error = new Error('Ongeldig wachtwoord');
    error.status = 401; 
    return next(error);
  }

  actorService.delete(actorId, (err) => {
    if (err) {
      const error = new Error('Acteur niet gevonden');
      error.status = 404; 
      return next(error);
    }
    res.redirect('/actor');
  });
},
};

module.exports = actorController;