const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// ======= CHECAGEM DO JWT_SECRET =======
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Verifique o arquivo .env na raiz do projeto.');
}

// ======= ROTA DE REGISTRO =======
router.post('/register', async (req, res) => {
  const { email, senha, isAdmin = 0 } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    const [usuarioExistente] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    // Evita que alguém envie isAdmin=1 diretamente via corpo
    const adminSeguro = isAdmin === true || isAdmin === 1 ? 1 : 0;

    const [resultado] = await db.query(
      'INSERT INTO usuarios (email, senha, isAdmin) VALUES (?, ?, ?)',
      [email, senhaHash, adminSeguro]
    );

    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      id: resultado.insertId,
      email,
      isAdmin: adminSeguro
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

    const token = jwt.sign(
      { id: usuario.id, isAdmin: !!usuario.isAdmin },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: {
        id: usuario.id,
        email: usuario.email,
        isAdmin: !!usuario.isAdmin
      },
      token
    });
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    return res.status(500).json({ message: 'Erro ao fazer login' });
  }
});

// ======= LISTAR TODOS OS USUÁRIOS =======
router.get('/', async (req, res) => {
  try {
    const [usuarios] = await db.query(
      'SELECT id, email, isAdmin FROM usuarios ORDER BY id ASC'
    );
    res.status(200).json(usuarios);
  } catch (erro) {
    console.error('Erro ao listar usuários:', erro);
    res.status(500).json({ message: 'Erro ao listar usuários' });
  }
});

// ======= ATUALIZAR STATUS DE ADMIN =======
router.put('/:id/admin', async (req, res) => {
  const { id } = req.params;
  const { isAdmin } = req.body;

  try {
    const [resultado] = await db.query(
      'UPDATE usuarios SET isAdmin = ? WHERE id = ?',
      [isAdmin ? 1 : 0, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.status(200).json({ message: 'Status de admin atualizado com sucesso' });
  } catch (erro) {
    console.error('Erro ao atualizar admin:', erro);
    res.status(500).json({ message: 'Erro ao atualizar admin' });
  }
});

module.exports = router;
