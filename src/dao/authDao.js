const pool = require("../db/database");

module.exports = {
  getByEmail(email, callback) {
    pool.execute(
      `SELECT staff_id, first_name, last_name, email, password, active
       FROM staff 
       WHERE email = ? AND active = 1`,
      [email],
      (err, rows) => {
        if (err) {
          console.error('Database error in getByEmail:', err);
          return callback(err, null);
        }
        callback(null, rows[0]);
      }
    );
  },

  getById(id, callback) {
    pool.execute(
      `SELECT staff_id, first_name, last_name, email, active
       FROM staff 
       WHERE staff_id = ? AND active = 1`,
      [id],
      (err, rows) => {
        if (err) {
          console.error('Database error in getById:', err);
          return callback(err, null);
        }
        callback(null, rows[0]);
      }
    );
  }
};