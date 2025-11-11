// index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Carrega variáveis do .env primeiro

const express = require('express');
const cors = require('cors');
const app = express();

// Confirmação de que a variável está carregada
console.log('JWT_SECRET:', process.env.JWT_SECRET);

// Middleware CORS - permite qualquer origem
app.use(cors());

const examesPdfRouter = require('./routes/examesPdf');
app.use('/exames', examesPdfRouter);


// Middleware para interpretar JSON
app.use(express.json());

// Importando as rotas
const usuarioRoutes = require('./routes/usuario');
const pacienteRoutes = require('./routes/paciente');
const exameRoutes = require('./routes/exame');

// Usando as rotas com prefixos
app.use('/users', usuarioRoutes);
app.use('/pacientes', pacienteRoutes);
app.use('/exames', exameRoutes);

// Rota raiz (opcional)
app.get('/', (req, res) => {
  res.send('API DevMotors rodando!');
});

// Iniciando o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
