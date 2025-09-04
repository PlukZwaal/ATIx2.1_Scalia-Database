const db = require('../db/database'); // pas pad aan naar jouw db

const staffDao = {
  getAll: async () => {
    const [rows] = await db.execute(`
      SELECT 
        *
      FROM staff
    `);
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.execute(`
      SELECT 
        *
      FROM staff s
      JOIN address a ON s.address_id = a.address_id
      JOIN city ci ON a.city_id = ci.city_id
      JOIN country co ON ci.country_id = co.country_id
      WHERE s.staff_id = ?
    `, [id]);
    return rows[0]; 
  }
};

module.exports = staffDao;
