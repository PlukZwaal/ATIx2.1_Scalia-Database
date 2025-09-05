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

  create(data, callback) {
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Connection error:', err);
        return callback(err, null);
      }

      conn.beginTransaction((err) => {
        if (err) {
          conn.release();
          return callback(err, null);
        }

        // Eerst address aanmaken
        conn.execute(
          `INSERT INTO address 
            (address, address2, district, city_id, postal_code, phone, location, last_update)
           VALUES (?, ?, ?, ?, ?, ?, ST_GeomFromText('POINT(0 0)'), NOW())`,
          [
            data.address,
            data.address2 || null,
            data.district,
            data.city_id,
            data.postal_code,
            data.phone,
          ],
          (err, addrRes) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                callback(err, null);
              });
            }

            const addressId = addrRes.insertId;

            // Dan staff aanmaken
            conn.execute(
              `INSERT INTO staff 
                (first_name, last_name, address_id, email, store_id, active, username, password, last_update)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
              [
                data.first_name,
                data.last_name,
                addressId,
                data.email,
                data.store_id,
                data.active ?? 1,
                data.username,
                data.password || "default123",
              ],
              (err, staffRes) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    callback(err, null);
                  });
                }

                conn.commit((err) => {
                  conn.release();
                  if (err) {
                    return callback(err, null);
                  }
                  callback(null, { staff_id: staffRes.insertId, address_id: addressId });
                });
              }
            );
          }
        );
      });
    });
  },

  getStores(callback) {
    pool.execute(
      `SELECT s.store_id, a.address
       FROM store s
       JOIN address a ON s.address_id = a.address_id`,
      (err, rows) => {
        if (err) {
          console.error('Database error in getStores:', err);
          return callback(err, null);
        }
        callback(null, rows);
      }
    );
  },

  getCities(callback) {
    pool.execute(
      `SELECT city_id, city FROM city`,
      (err, rows) => {
        if (err) {
          console.error('Database error in getCities:', err);
          return callback(err, null);
        }
        callback(null, rows);
      }
    );
  }
};