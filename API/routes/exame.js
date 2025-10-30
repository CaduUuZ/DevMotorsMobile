const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar todos os exames
router.get('/', (req, res) => {
  const { paciente } = req.query;
  let sql = `
    SELECT 
      e.idExame, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
      p.idPaciente, p.nome, p.dataNascimento, p.telefone, p.email, p.nomeMae, p.idade, p.medicamento, p.patologia
    FROM exames e
    JOIN pacientes p ON e.idPaciente = p.idPaciente
  `;
  let params = [];
  if (paciente) {
    sql += ' WHERE e.idPaciente = ?';
    params.push(paciente);
  }
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Buscar exame por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.query('SELECT * FROM exames WHERE idExame = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    res.json(results[0]);
  });
});

// Inserir novo exame
router.post('/', (req, res) => {
  const { idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais } = req.body;

  if (!idPaciente || !laboratorio || !exameTexto) {
    return res.status(400).json({ message: 'Campos obrigatórios: idPaciente, laboratorio, exameTexto' });
  }

  db.query('SELECT * FROM pacientes WHERE idPaciente = ?', [idPaciente], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Paciente não encontrado' });

    const sql = `
      INSERT INTO exames (idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais];

    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        idExame: result.insertId,
        idPaciente,
        laboratorio,
        exameTexto,
        dataExame,
        resultado,
        informacoesAdicionais
      });
    });
  });
});

// Editar exame
router.put('/:id', (req, res) => {
  const idExame = parseInt(req.params.id);
  const { idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais } = req.body;

  const sql = `
    UPDATE exames 
    SET idPaciente=?, laboratorio=?, exameTexto=?, dataExame=?, resultado=?, informacoesAdicionais=?
    WHERE idExame=?
  `;
  const params = [idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais, idExame];

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    res.json({ idExame, idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais });
  });
});

// Excluir exame
router.delete('/:id', (req, res) => {
  const idExame = parseInt(req.params.id);
  db.query('DELETE FROM exames WHERE idExame = ?', [idExame], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    res.status(204).send();
  });
});

module.exports = router;
