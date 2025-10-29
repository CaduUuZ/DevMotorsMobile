// routes/usuario.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

// ======= ROTA DE REGISTRO =======
router.post('/register', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    // Consulta se o usuário já existe
    const [usuarioExistente] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarioExistente.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    // Hash da senha
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Insere o usuário
    const [resultado] = await db.query(
      'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
      [email, senhaHash]
    );

    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      id: resultado.insertId
    });

  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    return res.status(500).json({
      message: 'Erro ao registrar usuário',
      error: erro.message
    });
  }
});

// ======= ROTA DE LOGIN =======
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const usuario = usuarios[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        email: usuario.email
      }
    });

  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    return res.status(500).json({
      message: 'Erro ao fazer login',
      error: erro.message
    });
  }
});

module.exports = router;
