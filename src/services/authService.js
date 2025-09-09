const authDao = require('../dao/authDao');
const bcrypt = require('bcrypt');

const authService = {
  authenticate: (email, password, callback) => {
    authDao.getByEmail(email, (err, user) => {
      if (err) {
        return callback(err, null);
      }
      
      if (!user) {
        const error = new Error('Onjuiste inloggegevens');
        error.status = 401;
        return callback(error, null);
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return callback(err, null);
        }
        
        if (!isMatch) {
          const error = new Error('Onjuiste inloggegevens');
          error.status = 401;
          return callback(error, null);
        }

        const userData = {
          staff_id: user.staff_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        };

        callback(null, userData);
      });
    });
  },

  getById: (id, callback) => authDao.getById(id, callback)
};

module.exports = authService;