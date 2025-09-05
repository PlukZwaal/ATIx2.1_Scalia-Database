const staffService = require('../services/staffService');

const staffController = {
  getAll: (req, res, next) => {
    staffService.getAll((err, staff) => {
      if (err) {
        return next(err);
      }
      res.render('staff', { title: 'Staff', staff });
    });
  },

  getById: (req, res, next) => {
    const staffId = Number(req.params.id);
    
    staffService.getById(staffId, (err, staff) => {
      if (err) {
        return next(err);
      }
      if (!staff) {
        return res.status(404).send('Staff not found');
      }
      res.render('staffDetail', { title: `Details van ${staff.full_name}`, staff });
    });
  },
};

module.exports = staffController;