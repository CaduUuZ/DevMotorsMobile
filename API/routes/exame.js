const express = require('express');
const router = express.Router();
const db = require('../db'); // pool promise (mysql2/promise)

// Listar exames (aceita ?buscaId= ou ?paciente=)
router.get('/', async (req, res) => {
  const buscaId = req.query.buscaId || req.query.paciente || null;
  let sql = `
    SELECT 
      e.idExame, e.idPaciente, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
      p.nome, p.idade, p.email
    FROM exames e
    LEFT JOIN pacientes p ON e.idPaciente = p.idPaciente
  `;
  const params = [];
  if (buscaId) {
    sql += ' WHERE e.idPaciente = ?';
    params.push(buscaId);
  }
  sql += ' ORDER BY e.idExame DESC';

  try {
    const [rows] = await db.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error('[API] erro GET /exames:', err);
    return res.status(500).json({ error: err.message || 'Erro ao buscar exames' });
  }
});

// Buscar exame por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [rows] = await db.query('SELECT * FROM exames WHERE idExame = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('[API] erro GET /exames/:id', err);
    return res.status(500).json({ error: err.message });
  }
});

// Inserir novo exame (aceita pacienteId ou idPaciente no body)
router.post('/', async (req, res) => {
  const {
    pacienteId,
    idPaciente,
    laboratorio,
    exameTexto,
    dataExame,
    resultado,
    informacoesAdicionais
  } = req.body;

  const idPac = pacienteId || idPaciente;
  if (!idPac || !laboratorio || !exameTexto) {
    return res.status(400).json({ message: 'Campos obrigatórios: pacienteId/idPaciente, laboratorio, exameTexto' });
  }

  try {
    // checa se paciente existe
    const [pacRows] = await db.query('SELECT idPaciente FROM pacientes WHERE idPaciente = ?', [idPac]);
    if (!pacRows || pacRows.length === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    const dataVal = dataExame || new Date();
    const sql = `
      INSERT INTO exames (idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [idPac, laboratorio, exameTexto, dataVal, resultado || null, informacoesAdicionais || null];

    const [result] = await db.query(sql, params);
    const insertedId = result.insertId;

    // retornar o exame criado já com nome do paciente
    const [rows] = await db.query(
      `SELECT e.idExame, e.idPaciente, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
              p.nome
       FROM exames e LEFT JOIN pacientes p ON e.idPaciente = p.idPaciente
       WHERE e.idExame = ?`,
      [insertedId]
    );

    return res.status(201).json(rows[0] || { insertedId });
  } catch (err) {
    console.error('[API] erro POST /exames:', err);
    return res.status(500).json({ error: err.message || 'Erro ao criar exame' });
  }
});

// Editar exame
router.put('/:id', async (req, res) => {
  const idExame = parseInt(req.params.id, 10);
  const { idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais } = req.body;

  try {
    const sql = `
      UPDATE exames 
      SET idPaciente=?, laboratorio=?, exameTexto=?, dataExame=?, resultado=?, informacoesAdicionais=?
      WHERE idExame=?
    `;
    const params = [idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais, idExame];
    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    return res.json({ idExame, idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais });
  } catch (err) {
    console.error('[API] erro PUT /exames/:id', err);
    return res.status(500).json({ error: err.message });
  }
});

// Excluir exame
router.delete('/:id', async (req, res) => {
  const idExame = parseInt(req.params.id, 10);
  try {
    const [result] = await db.query('DELETE FROM exames WHERE idExame = ?', [idExame]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    return res.status(204).send();
  } catch (err) {
    console.error('[API] erro DELETE /exames/:id', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
