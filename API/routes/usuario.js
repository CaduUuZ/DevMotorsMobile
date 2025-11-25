const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET não definido. Verifique o arquivo .env na raiz do projeto.');
}

// POST /register
// Recebe email/senha, valida, cria hash e insere usuário.
router.post('/register', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

  try {
    const [usuarioExistente] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarioExistente.length > 0) return res.status(409).json({ message: 'Email já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const [resultado] = await db.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, senhaHash]);

    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      usuario: { id: resultado.insertId, email }
    });
  } catch (erro) {
    console.error('Erro ao registrar usuário:', erro);
    return res.status(500).json({ message: 'Erro ao registrar usuário', error: erro.message });
  }
});

// POST /login
// Valida credenciais, gera token e retorna usuário com isAdmin.
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ message: 'Email e senha são obrigatórios' });

  try {
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) return res.status(401).json({ message: 'Email ou senha incorretos' });

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ message: 'Email ou senha incorretos' });

    const isAdminFlag = !!(usuario.isAdmin || usuario.admin || usuario.role === 'admin' || usuario.role === 'ADMIN');
    const payload = { id: usuario.id, email: usuario.email, isAdmin: isAdminFlag };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      usuario: { id: payload.id, email: usuario.email, isAdmin: isAdminFlag, role: usuario.role || null },
      token
    });
  } catch (erro) {
    console.error('Erro ao fazer login:', erro);
    return res.status(500).json({ message: 'Erro ao fazer login', error: erro.message });
  }
});

// GET /users
// Retorna lista de usuários no formato esperado pelo front.
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM usuarios ORDER BY id ASC');
    const mapped = rows.map(r => ({
      id: r.id,
      email: r.email,
      nome: r.nome || r.email || '',
      isAdmin: !!(r.isAdmin || r.admin || false)
    }));
    return res.json(mapped);
  } catch (err) {
    console.error('[API] erro GET /users:', err);
    return res.status(500).json({ message: 'Erro ao listar usuários', error: err.message });
  }
});

// PUT /users/:id/admin
// Atualiza flag isAdmin (ou admin) e retorna usuário atualizado.
router.put('/:id/admin', async (req, res) => {
  const id = req.params.id;
  const { isAdmin } = req.body;
  if (typeof isAdmin === 'undefined') return res.status(400).json({ message: 'isAdmin é obrigatório no body' });

  try {
    try {
      await db.query('UPDATE usuarios SET isAdmin = ? WHERE id = ?', [isAdmin ? 1 : 0, id]);
    } catch (errUpdate) {
      if (errUpdate && errUpdate.code === 'ER_BAD_FIELD_ERROR') {
        await db.query('UPDATE usuarios SET admin = ? WHERE id = ?', [isAdmin ? 1 : 0, id]);
      } else {
        throw errUpdate;
      }
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

    const u = rows[0];
    return res.json({ id: u.id, email: u.email, nome: u.nome || u.email || '', isAdmin: !!(u.isAdmin || u.admin || false) });
  } catch (err) {
    console.error('[API] erro PUT /users/:id/admin:', err);
    return res.status(500).json({ message: 'Erro ao atualizar usuário', error: err.message });
  }
});

module.exports = router;
