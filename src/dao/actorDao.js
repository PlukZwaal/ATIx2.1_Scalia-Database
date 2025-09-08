const pool = require("../db/database");

module.exports = {
  getAll(callback) {
    pool.execute(
      `SELECT
         a.actor_id,
         CONCAT(a.first_name, ' ', a.last_name) AS full_name,
         COUNT(fa.film_id) AS film_count
       FROM
         actor a
       LEFT JOIN
         film_actor fa ON a.actor_id = fa.actor_id
       GROUP BY
         a.actor_id
       ORDER BY
         a.first_name ASC, a.last_name ASC`,
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

  create(actorData, callback) {
    const { first_name, last_name } = actorData;
    
    pool.execute(
      `INSERT INTO actor (first_name, last_name, last_update) 
       VALUES (?, ?, NOW())`,
      [first_name, last_name],
      (err, result) => {
        if (err) {
          console.error('Database error in create:', err);
          return callback(err, null);
        }
        
        // Return the created actor with the new ID
        const newActor = {
          actor_id: result.insertId,
          first_name: first_name,
          last_name: last_name,
          full_name: `${first_name} ${last_name}`
        };
        
        console.log('Actor created successfully:', newActor);
        callback(null, newActor);
      }
    );
  },

  update(id, actorData, callback) {
    const { first_name, last_name } = actorData;
    
    pool.execute(
      `UPDATE actor 
       SET first_name = ?, last_name = ?, last_update = NOW()
       WHERE actor_id = ?`,
      [first_name, last_name, id],
      (err, result) => {
        if (err) {
          console.error('Database error in update:', err);
          return callback(err, null);
        }
        
        if (result.affectedRows === 0) {
          const error = new Error('Acteur niet gevonden');
          error.status = 404;
          return callback(error, null);
        }
        
        // Return the updated actor data
        const updatedActor = {
          actor_id: id,
          first_name: first_name,
          last_name: last_name,
          full_name: `${first_name} ${last_name}`
        };
        
        console.log('Actor updated successfully:', updatedActor);
        callback(null, updatedActor);
      }
    );
  }
};