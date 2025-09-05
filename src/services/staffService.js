const staffDao = require('../dao/staffDao');

const staffService = {
  getAll: (callback) => staffDao.getAll(callback),
  getById: (id, callback) => staffDao.getById(id, callback),
};

module.exports = staffService;