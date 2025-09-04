const staffService = require('../services/staffService');

const staffController = {
  getAll: async (req, res, next) => {
    try {
      const staff = await staffService.getAll();
      res.render('staff', { title: 'Staff', staff });
    } catch (err) {
      next(err);
    }
  },

  showCreateForm: async (req, res, next) => {
    try {
      const [stores, cities] = await Promise.all([
        staffService.getStores(),
        staffService.getCities()
      ]);
      res.render('staffCreate', { title: 'Nieuwe medewerker', stores, cities });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
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

  const newStaff = await staffService.create(payload);
  return res.redirect(`/staff/${newStaff.staff_id}`);
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const staffId = Number(req.params.id);
      const staff = await staffService.getById(staffId);
      if (!staff) return res.status(404).send('Staff not found');
      res.render('staffDetail', { title: `Details van ${staff.full_name}`, staff });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = staffController;
