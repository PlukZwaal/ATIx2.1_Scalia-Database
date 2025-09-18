require('dotenv').config();
const mysql = require('mysql2');

// Let op: 'env' wordt alleen lokaal gebruikt.
// In Azure worden de variabelen via de 'Application Settings' geladen.

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true, 
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

// Exporteer de verbinding zodat je deze in je app kunt gebruiken
module.exports = pool;