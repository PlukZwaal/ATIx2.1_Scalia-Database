const mysql = require('mysql2');
require('dotenv').config();

// Maak een connection pool voor betere performance
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Zet de pool om naar promises voor async/await ondersteuning
const promisePool = pool.promise();

module.exports = promisePool;