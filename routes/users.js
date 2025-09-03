const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Haal alle gebruikers op vanuit de database
router.get('/', async (req, res) => {
  try {
    // Query om klanten op te halen (customer viewpoint)
    const [users] = await db.execute(`
      SELECT 
        id,
        first_name,
        last_name,
        email,
        created_at
      FROM user 
      ORDER BY first_name, last_name
      LIMIT 50
    `);
    
    // Render de index pagina met de gebruikersdata
    res.render('index', { 
      title: 'Sakila Klantenoverzicht',
      users: users 
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