const staffService = require('../services/staffService');

const staffController = {
  getAll: async (req, res, next) => {
    try {
      const staff = await staffService.getAll();
      res.render('staff', { staff, title: 'Medewerkerslijst' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = staffController; 
