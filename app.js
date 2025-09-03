const express = require('express');
const path = require('path');
require('dotenv').config();

// Importeer database configuratie met alle gegevens die weer veilig zijn opgeslagen.
const db = require('./config/database');

// Importeer routes
const customerRoutes = require('./routes/customer');

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
app.use('/', customerRoutes);

// Test databaseverbinding
async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('Verbonden met de Sakila database!');
    
    // Een test om te kijken of er wel echt een goede verbinding is 
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM customer');
    console.log(`Aantal klanten in database: ${rows[0].count}`);
    
    connection.release();
  } catch (error) {
    console.error('Databaseverbinding mislukt:', error.message);
  }
}

testConnection();

// Start server
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});