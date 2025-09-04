const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (req, res) => {
  try {
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
    
    res.render('customerslist', { 
      title: 'Klantenlijst',
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