// db.js
const mysql = require('mysql2/promise'); // <-- versão promise

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lab_faculdade',
  port: 3307,           // sua porta customizada
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;
