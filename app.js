const express = require('express');
const path = require('path');
require('dotenv').config();

// Importeer database configuratie
const db = require('./config/database');

// Importeer routes
const userRoutes = require('./routes/users');

// Initialiseer Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Stel EJS in als template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware voor het parsen van request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Statische bestanden serveren
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', userRoutes);

// Test databaseverbinding
// Test databaseverbinding
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Verbonden met de Sakila database!');
    
    // Test een eenvoudige query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM user');
    console.log(`📊 Aantal klanten in database: ${rows[0].count}`);
    
    connection.release();
  } catch (error) {
    console.error('❌ Databaseverbinding mislukt:', error.message);
    console.log('Controleer of:');
    console.log('1. MySQL server draait');
    console.log('2. Database naam correct is');
    console.log('3. Gebruikersnaam en wachtwoord kloppen');
    console.log('4. De Sakila database is geïmporteerd');
  }
}

testConnection();

// Start server
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});