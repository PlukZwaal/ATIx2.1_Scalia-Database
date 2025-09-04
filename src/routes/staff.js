const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const [staff] = await db.execute(`
      SELECT 
        s.staff_id,
        CONCAT(s.first_name, ' ', s.last_name) AS full_name,
        s.email,
        s.username,
        s.store_id,
        s.active,
        DATE_FORMAT(s.last_update, '%Y-%m-%d %H:%i') AS last_update,
        a.address,
        a.address2,
        a.district,
        a.postal_code,
        a.phone,
        c.city,
        co.country
      FROM staff s
      JOIN address a ON s.address_id = a.address_id
      JOIN city c ON a.city_id = c.city_id
      JOIN country co ON c.country_id = co.country_id
    `);
    
    res.render('stafflist', { 
      title: 'Medewerkerslijst',
      staff: staff 
    });
  } catch (error) {
    console.error('Fout bij ophalen gebruikers:', error);
    res.status(500).render('error', { 
      title: 'Fout',
      message: 'Er is een fout opgetreden bij het ophalen van de gegevens.' 
    });
  }
});

module.exports = router;