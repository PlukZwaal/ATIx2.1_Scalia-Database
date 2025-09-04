const express = require('express');
const path = require('path');
require('dotenv').config();

const db = require('./config/database');

const customerRoutes = require('./routes/customer');
const homeRoutes = require('./routes/home');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRoutes);
app.use('/klantenlijst', customerRoutes);

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log('Database connectie gelukt.');
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM customer');
    console.log(`Aantal klanten gevonden: ${rows[0].count}`);
    
    connection.release();
  } catch (error) {
    console.error('Database connectie mislukt:', error.message);
  }
}

testConnection();

app.listen(PORT, () => {
  console.log(`Server is live op http://localhost:${PORT}`);
});