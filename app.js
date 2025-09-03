const express = require('express');
const path = require('path');
require('dotenv').config();

// Haal de database config binnen - hopelijk werkt het gewoon
const db = require('./config/database');

// Routes die we gaan gebruiken
const customerRoutes = require('./routes/customer');
const homeRoutes = require('./routes/home');

// Maak een nieuwe express app aan
const app = express();
const PORT = process.env.PORT || 3000;

// Zet EJS neer als onze view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Zorg dat we form data kunnen uitlezen
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Statische files zoals CSS en images
app.use(express.static(path.join(__dirname, 'public')));

// Hang de routes aan onze app
app.use('/', homeRoutes);
app.use('/klantenlijst', customerRoutes);

// Check even of die database connectie echt werkt
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('Yes! Database connectie gelukt, we zitten in Sakila!');
    
    // Even kijken of er ook echt klanten in de database zitten als dubbelcheck
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM customer');
    console.log(`Aantal klanten gevonden: ${rows[0].count} - dat zijn er best wel veel`);
    
    connection.release();
  } catch (error) {
    console.error('Database connectie mislukt:', error.message);
  }
}

testConnection();

// Start de server
app.listen(PORT, () => {
  console.log(`Server is live op http://localhost:${PORT} - ga er even naartoe!`);
});