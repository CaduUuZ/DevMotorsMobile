// index.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') }); // Carrega variáveis do .env primeiro

const express = require('express');
const cors = require('cors');
const app = express();

console.log('JWT_SECRET:', process.env.JWT_SECRET);

app.use(cors());

// registrar middleware de logging curto (temporário)
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.path}`);
  next();
});

// interpretar JSON antes das rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const examesPdfRouter = require('./routes/examesPdf');
const usuarioRoutes = require('./routes/usuario');
const pacienteRoutes = require('./routes/paciente');
const exameRoutes = require('./routes/exame');

// montar routers sem conflito
app.use('/exames/pdf', examesPdfRouter);
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
