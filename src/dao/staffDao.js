const pool = require("../db/database");

module.exports = {
  async getAll() {
    const [rows] = await pool.execute(
      `SELECT s.staff_id, s.first_name, s.last_name, s.email, s.store_id, s.active,
              a.address, a.district, c.city, co.country, s.username, s.last_update
       FROM staff s
       JOIN address a ON s.address_id = a.address_id
       JOIN city c ON a.city_id = c.city_id
       JOIN country co ON c.country_id = co.country_id`
    );
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.execute(
      `SELECT s.staff_id, s.first_name, s.last_name, s.email, s.store_id, s.active,
              a.address, a.district, c.city, co.country, s.username, s.last_update
       FROM staff s
       JOIN address a ON s.address_id = a.address_id
       JOIN city c ON a.city_id = c.city_id
       JOIN country co ON c.country_id = co.country_id
       WHERE s.staff_id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [addrRes] = await conn.execute(
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
        ]
      );

      const addressId = addrRes.insertId;

      const [staffRes] = await conn.execute(
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
        ]
      );

      await conn.commit();
      return { staff_id: staffRes.insertId, address_id: addressId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getStores() {
    const [rows] = await pool.execute(
      `SELECT s.store_id, a.address
       FROM store s
       JOIN address a ON s.address_id = a.address_id`
    );
    return rows;
  },

  async getCities() {
    const [rows] = await pool.execute(
      `SELECT city_id, city FROM city`
    );
    return rows;
  }

};
