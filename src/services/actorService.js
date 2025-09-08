const actorDao = require('../dao/actorDao');

const actorService = {
  getAll: (callback) => actorDao.getAll(callback),
  getById: (id, callback) => actorDao.getById(id, callback),
  getFilmsByActorId: (id, callback) => actorDao.getFilmsByActorId(id, callback),
  create: (actorData, callback) => actorDao.create(actorData, callback),
  update: (id, actorData, callback) => actorDao.update(id, actorData, callback),
  delete: (id, callback) => actorDao.delete(id, callback),
};

module.exports = actorService;