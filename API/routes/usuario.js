const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// ======= ROTA DE REGISTRO =======
router.post('/register', async (req, res) => {
  const { email, senha, isAdmin = 0 } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const [usuarioExistente] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const [resultado] = await db.query(
      'INSERT INTO usuarios (email, senha, isAdmin) VALUES (?, ?, ?)',
      [email, senhaHash, isAdmin]
    );

    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      id: resultado.insertId,
      email,
      isAdmin
    });

  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    return res.status(500).json({ message: 'Erro ao registrar usuário' });
  }
});

// ======= ROTA DE LOGIN =======
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);

    if (usuarios.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Gera token com isAdmin no payload
    const token = jwt.sign(
      { id: usuario.id, isAdmin: usuario.isAdmin === 1 },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    // Retorna dados esperados pelo app
    return res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        isAdmin: usuario.isAdmin === 1
      },
      token
    });

  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

module.exports = router;
