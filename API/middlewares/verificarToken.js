const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar se é admin
function verificarAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1]; // formato: Bearer <token>

  if (!token) {
    return res.status(401).json({ message: 'Token inválido ou ausente' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Acesso restrito a administradores' });
    }

    // anexa o usuário decodificado à requisição (opcional)
    req.usuario = decoded;
    next();

  } catch (err) {
    console.error('Erro ao verificar token:', err.message);
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

module.exports = { verificarAdmin };
