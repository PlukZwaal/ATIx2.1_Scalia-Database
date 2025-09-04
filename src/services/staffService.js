const staffDao = require('../dao/staffDao');

const staffService = {
  getAll: async () => {
    try {
      const staff = await staffDao.getAll();
      return staff;
    } catch (err) {
      console.error('Service error:', err);
      throw err;
    }
  },
};

module.exports = staffService;
