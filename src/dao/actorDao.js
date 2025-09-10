const pool = require("../db/database");

module.exports = {
  // Haal alle acteurs op met aantal films
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
        callback(null, rows);
      }
    );
  },

  // Haal acteur op via ID
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

  // Haal alle films van een acteur
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

  // Haal films die niet gekoppeld zijn aan deze acteur
  getAvailableFilmsForActor(actorId, callback) {
    pool.execute(
      `SELECT f.film_id, f.title, f.release_year
       FROM film f
       WHERE f.film_id NOT IN (
         SELECT fa.film_id 
         FROM film_actor fa 
         WHERE fa.actor_id = ?
       )
       ORDER BY f.title ASC`,
      [actorId],
      (err, rows) => {
        if (err) {
          console.error('Database error in getAvailableFilmsForActor:', err);
          return callback(err, null);
        }
        callback(null, rows);
      }
    );
  },

  // Koppel acteur aan film
  addActorToFilm(actorId, filmId, callback) {
    pool.execute(
      `INSERT INTO film_actor (actor_id, film_id, last_update) 
       VALUES (?, ?, NOW())`,
      [actorId, filmId],
      (err, result) => {
        if (err) {
          console.error('Database error in addActorToFilm:', err);
          return callback(err, null);
        }
        console.log(`Actor ${actorId} gekoppeld aan film ${filmId}`);
        callback(null, result);
      }
    );
  },

  // Ontkoppel acteur van film
  removeActorFromFilm(actorId, filmId, callback) {
    pool.execute(
      `DELETE FROM film_actor 
       WHERE actor_id = ? AND film_id = ?`,
      [actorId, filmId],
      (err, result) => {
        if (err) {
          console.error('Database error in removeActorFromFilm:', err);
          return callback(err, null);
        }
        if (result.affectedRows === 0) {
          const error = new Error('Koppeling niet gevonden');
          error.status = 404;
          return callback(error, null);
        }
        console.log(`Actor ${actorId} ontkoppeld van film ${filmId}`);
        callback(null, result);
      }
    );
  },

  // Maak nieuwe acteur aan
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

  // Update bestaande acteur
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
  },

  // Verwijder acteur en bijbehorende film koppelingen
  delete(id, callback) {
    pool.getConnection((err, conn) => {
      if (err) {
        console.error('Database connection error:', err);
        return callback(err);
      }

      conn.beginTransaction(err => {
        if (err) {
          conn.release();
          return callback(err);
        }

        // Verwijder eerst alle koppelingen met films
        conn.execute(
          `DELETE FROM film_actor WHERE actor_id = ?`,
          [id],
          (err) => {
            if (err) {
              return conn.rollback(() => {
                conn.release();
                console.error('Error deleting from film_actor:', err);
                callback(err);
              });
            }

            // Verwijder daarna de acteur zelf
            conn.execute(
              `DELETE FROM actor WHERE actor_id = ?`,
              [id],
              (err, result) => {
                if (err) {
                  return conn.rollback(() => {
                    conn.release();
                    console.error('Error deleting actor:', err);
                    callback(err);
                  });
                }

                if (result.affectedRows === 0) {
                  return conn.rollback(() => {
                    conn.release();
                    const error = new Error('Acteur niet gevonden');
                    error.status = 404;
                    callback(error);
                  });
                }

                conn.commit(err => {
                  if (err) {
                    return conn.rollback(() => {
                      conn.release();
                      console.error('Commit error:', err);
                      callback(err);
                    });
                  }
                  conn.release();
                  console.log(`Actor ${id} + koppelingen verwijderd`);
                  callback(null);
                });
              }
            );
          }
        );
      });
    });
  },
};
