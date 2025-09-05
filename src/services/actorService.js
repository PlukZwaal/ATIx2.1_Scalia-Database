const actorDao = require('../dao/actorDao');

const actorService = {
  getAll: (callback) => actorDao.getAll(callback),
  getById: (id, callback) => actorDao.getById(id, callback),
  getFilmsByActorId: (id, callback) => actorDao.getFilmsByActorId(id, callback),
};

module.exports = actorService;