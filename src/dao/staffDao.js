const db = require('../db/database');

const staffDao = {
  getAll: async () => {
    try {
      const [rows] = await db.query('SELECT * FROM staff'); // pas tabelnaam aan als nodig
      return rows;
    } catch (err) {
      console.error('DAO error:', err);
      throw err;
    }
  },
};

module.exports = staffDao;