const pool = require("../db/database");

module.exports = {
  getAll(callback) {
    pool.execute(
      `SELECT actor_id, first_name, last_name, last_update,
              CONCAT(first_name, ' ', last_name) as full_name
       FROM actor 
       ORDER BY last_name ASC, first_name ASC`,
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
      `SELECT a.actor_id, a.first_name, a.last_name, a.last_update,
              CONCAT(a.first_name, ' ', a.last_name) as full_name
       FROM actor a
       WHERE a.actor_id = ?`,
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

  getFilmsByActorId(id, callback) {
    console.log('Getting films for actor ID:', id);
    pool.execute(
      `SELECT f.film_id, f.title, f.description, f.release_year, f.length, 
              f.rating, c.name as category_name
       FROM film f
       JOIN film_actor fa ON f.film_id = fa.film_id
       LEFT JOIN film_category fc ON f.film_id = fc.film_id
       LEFT JOIN category c ON fc.category_id = c.category_id
       WHERE fa.actor_id = ?
       ORDER BY f.title ASC`,
      [id],
      (err, rows) => {
        if (err) {
          console.error('Database error in getFilmsByActorId:', err);
          return callback(err, null);
        }
        console.log(`Found ${rows.length} films for actor ${id}:`, rows);
        callback(null, rows);
      }
    );
  },
};