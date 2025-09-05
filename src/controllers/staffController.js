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

  showCreateForm: (req, res, next) => {
    staffService.getStores((err, stores) => {
      if (err) {
        return next(err);
      }
      
      // Dan cities ophalen
      staffService.getCities((err, cities) => {
        if (err) {
          return next(err);
        }
        
        res.render('staffCreate', { title: 'Nieuwe medewerker', stores, cities });
      });
    });
  },

  create: (req, res, next) => {
    const payload = {
      first_name: req.body.first_name?.trim(),
      last_name: req.body.last_name?.trim(),
      email: req.body.email?.trim() || null,
      username: req.body.username?.trim(),
      store_id: Number(req.body.store_id),   
      active: Number(req.body.active),       
      address: req.body.address?.trim(),
      address2: req.body.address2?.trim() || null,
      district: req.body.district?.trim(),
      city_id: Number(req.body.city_id),    
      postal_code: req.body.postal_code?.trim(),
      phone: req.body.phone?.trim() || null,
    };

    staffService.create(payload, (err, newStaff) => {
      if (err) {
        return next(err);
      }
      res.redirect(`/staff/${newStaff.staff_id}`);
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