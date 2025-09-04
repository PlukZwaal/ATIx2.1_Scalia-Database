const staffDao = require('../dao/staffDao');

const staffService = {
  getAll: () => staffDao.getAll(),
  getById: (id) => staffDao.getById(id),
  getStores: () => staffDao.getStores(),
  getCities: () => staffDao.getCities(),
  create: (data) => staffDao.create(data),
};

module.exports = staffService;
