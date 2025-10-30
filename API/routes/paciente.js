const express = require('express');
const router = express.Router();
const db = require('../db'); // db deve ser importado do mysql2/promise

// ------------------- LISTAR TODOS OS PACIENTES ------------------- //
router.get('/', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM pacientes');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- BUSCAR PACIENTE POR ID ------------------- //
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [results] = await db.query('SELECT * FROM pacientes WHERE idPaciente = ?', [id]);
    if (results.length === 0) return res.status(404).json({ message: 'Paciente não encontrado' });
    res.json(results[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- INSERIR NOVO PACIENTE ------------------- //
router.post('/', async (req, res) => {
  const { nome, dataNascimento, telefone, email, nomeMae, idade, medicamento, patologia } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO pacientes (nome, dataNascimento, telefone, email, nomeMae, idade, medicamento, patologia) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [nome, dataNascimento, telefone, email, nomeMae, idade, medicamento, patologia]
    );
    res.status(201).json({ id: result.insertId, nome, dataNascimento, telefone, email, nomeMae, idade, medicamento, patologia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- EDITAR PACIENTE ------------------- //
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { nome, dataNascimento, telefone, email, nomeMae, idade, medicamento, patologia } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE pacientes SET nome=?, dataNascimento=?, telefone=?, email=?, nomeMae=?, idade=?, medicamento=?, patologia=? WHERE idPaciente=?',
      [nome, dataNascimento, telefone, email, nomeMae, idade, medicamento, patologia, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Paciente não encontrado' });
    res.json({ id, nome, dataNascimento, telefone, email, nomeMae, idade, medicamento, patologia });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------- EXCLUIR PACIENTE ------------------- //
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const [result] = await db.query('DELETE FROM pacientes WHERE idPaciente = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Paciente não encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
