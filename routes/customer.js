const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Haal alle gebruikers op vanuit de database
router.get('/', async (req, res) => {
  try {
    // Query om klanten op te halen (customer viewpoint)
    const [customers] = await db.execute(`
      SELECT 
        customer_id,
        first_name,
        last_name,
        email,
        create_date
      FROM customer 
      ORDER BY first_name, last_name
    `);
    
    // Render de index pagina met de gebruikersdata
    res.render('index', { 
      title: 'Sakila Klantenoverzicht',
      customers: customers 
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