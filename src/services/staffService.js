const staffDao = require('../dao/staffDao');

const staffService = {
  getAll: async () => {
    return await staffDao.getAll();
  },

  getById: async (id) => {
    return await staffDao.getById(id);
  },
};

module.exports = staffService;
