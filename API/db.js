const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'lab_faculdade',
  port: 3307 // porta customizada do seu MySQL
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao MySQL na porta 3307!');
});

module.exports = connection;
