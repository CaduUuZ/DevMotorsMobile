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

// Rotas relacionadas a usuários: registro e login.

/*
 * ROTA: POST /register
 * Descrição:
 * - Recebe `email` e `senha` no corpo da requisição.
 * - Valida campos obrigatórios.
 * - Verifica se já existe usuário com o mesmo email.
 * - Faz o hash da senha com bcrypt e insere o usuário no banco.
 * - Retorna um objeto `usuario` com `id` e `email` (NUNCA retorna a senha).
 */
router.post('/register', async (req, res) => {
  // Extrai email e senha do body da requisição
  const { email, senha } = req.body;

  // Validação simples: ambos campos são obrigatórios
  if (!email || !senha) {
    // 400 Bad Request quando parâmetros necessários estão ausentes
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    // Consulta para verificar se já existe usuário com o mesmo email
    // `db.query` retorna um array onde o primeiro elemento é o resultado
    const [usuarioExistente] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    // Se encontrou pelo menos um registro, retorna 409 Conflict
    if (usuarioExistente.length > 0) {
      return res.status(409).json({ message: 'Email já cadastrado' });
    }

    // Gera o hash da senha com custo/saltRounds configurado
    const saltRounds = 10;
    // bcrypt.hash é assíncrono e retorna a senha já hasheada
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // Insere o novo usuário no banco (armazenamos a senha hasheada)
    const [resultado] = await db.query(
      'INSERT INTO usuarios (email, senha) VALUES (?, ?)',
      [email, senhaHash]
    );

    // Retorna 201 Created com um objeto `usuario` contendo id e email
    // Observação: nunca expos o hash de senha na resposta
    return res.status(201).json({
      message: 'Usuário registrado com sucesso',
      usuario: {
        id: resultado.insertId,
        email: email
      }
    });

  } catch (erro) {
    // Log do erro no servidor para depuração
    console.error('Erro ao registrar usuário:', erro);
    // Resposta genérica para o cliente (500 Internal Server Error)
    return res.status(500).json({
      message: 'Erro ao registrar usuário',
      error: erro.message
    });
  }
});

/*
 * ROTA: POST /login
 * Descrição:
 * - Recebe `email` e `senha` no body.
 * - Busca usuário pelo email e compara a senha usando bcrypt.compare.
 * - Se válido, retorna informações mínimas do usuário (id, email).
 */
router.post('/login', async (req, res) => {
  // Extrai credenciais do corpo
  const { email, senha } = req.body;

  // Validação simples
  if (!email || !senha) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    // Busca o usuário pelo email
    const [usuarios] = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    // Se nenhum usuário encontrado, credenciais inválidas
    if (usuarios.length === 0) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Pega o primeiro (e esperado único) usuário encontrado
    const usuario = usuarios[0];

    // Compara a senha em texto com o hash armazenado
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      // Não informar qual dos dois estava errado por segurança
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Login bem-sucedido: retorna apenas campos necessários
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

// Exporta o router para ser usado em `index.js` ou arquivo de rotas principal
module.exports = router;
