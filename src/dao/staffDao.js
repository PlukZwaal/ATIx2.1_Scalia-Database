const pool = require("../db/database");

module.exports = {
  getAll(callback) {
    pool.execute(
      `SELECT s.staff_id, s.first_name, s.last_name, s.email, s.store_id, s.active,
              a.address, a.district, c.city, co.country, s.username, s.last_update,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
       FROM staff s
       JOIN address a ON s.address_id = a.address_id
       JOIN city c ON a.city_id = c.city_id
       JOIN country co ON c.country_id = co.country_id`,
      (err, rows) => {
        if (err) {
          console.error('Database error in getAll:', err);
          return callback(err, null);
        }
        console.log('Raw database result:', rows);
        callback(null, rows);
      }
    );
  },

  getById(id, callback) {
    pool.execute(
      `SELECT s.staff_id, s.first_name, s.last_name, s.email, s.store_id, s.active,
              a.address, a.address2, a.district, c.city, co.country, s.username, s.last_update, a.postal_code, a.phone,
              CONCAT(s.first_name, ' ', s.last_name) as full_name
       FROM staff s
       JOIN address a ON s.address_id = a.address_id
       JOIN city c ON a.city_id = c.city_id
       JOIN country co ON c.country_id = co.country_id
       WHERE s.staff_id = ?`,
      [id],
      (err, rows) => {
        if (err) {
          console.error('Database error in getById:', err);
          return callback(err, null);
        }
        callback(null, rows[0]);
      }
    );
  },
};