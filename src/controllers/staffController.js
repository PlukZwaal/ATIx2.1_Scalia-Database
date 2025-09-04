const staffService = require('../services/staffService');

const staffController = {
  getAll: async (req, res, next) => {
    try {
      const staff = await staffService.getAll();
      res.render('staff', { staff, title: 'Staff' });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const staffId = req.params.id;
      const staff = await staffService.getById(staffId);
      if (!staff) return res.status(404).send('Staff not found');
      res.render('staffDetail', { staff, title: `Details of ${staff.full_name}` });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = staffController;
