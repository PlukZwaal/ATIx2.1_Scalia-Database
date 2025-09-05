const staffDao = require('../dao/staffDao');

const staffService = {
  getAll: (callback) => staffDao.getAll(callback),
  getById: (id, callback) => staffDao.getById(id, callback),
  getStores: (callback) => staffDao.getStores(callback),
  getCities: (callback) => staffDao.getCities(callback),
  create: (data, callback) => staffDao.create(data, callback),
};

module.exports = staffService;