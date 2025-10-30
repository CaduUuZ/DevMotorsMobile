const express = require('express');
const router = express.Router();
const db = require('../db');

// Listar exames (com busca opcional por ID do paciente)
router.get('/', (req, res) => {
  const { buscaId } = req.query;
  let sql = `
    SELECT 
      e.idExame, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
      p.idPaciente, p.nome, p.dataNascimento, p.telefone, p.email, p.nomeMae, p.idade, p.medicamento, p.patologia
    FROM exames e
    JOIN pacientes p ON e.idPaciente = p.idPaciente
  `;
  let params = [];

  if (buscaId) {
    sql += ' WHERE e.idPaciente = ?';
    params.push(buscaId);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Buscar exame por ID do exame
router.get('/:idExame', (req, res) => {
  const idExame = parseInt(req.params.idExame);
  db.query('SELECT * FROM exames WHERE idExame = ?', [idExame], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    res.json(results[0]);
  });
});

// Inserir novo exame
router.post('/', (req, res) => {
  const { idPaciente, laboratorio, exameTexto, dataExame, resultado } = req.body;

  db.query('SELECT * FROM pacientes WHERE idPaciente = ?', [idPaciente], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Paciente não encontrado' });

    const sql = `
      INSERT INTO exames (idPaciente, laboratorio, exameTexto, dataExame, resultado)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(sql, [idPaciente, laboratorio, exameTexto, dataExame, resultado], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        idExame: result.insertId,
        idPaciente,
        laboratorio,
        exameTexto,
        dataExame,
        resultado
      });
    });
  });
});

// Editar exame existente
router.put('/:idExame', (req, res) => {
  const idExame = parseInt(req.params.idExame);
  const { idPaciente, laboratorio, exameTexto, dataExame, resultado } = req.body;

  const sql = `
    UPDATE exames
    SET idPaciente=?, laboratorio=?, exameTexto=?, dataExame=?, resultado=?
    WHERE idExame=?
  `;
  db.query(sql, [idPaciente, laboratorio, exameTexto, dataExame, resultado, idExame], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    res.json({ idExame, idPaciente, laboratorio, exameTexto, dataExame, resultado });
  });
});

// Excluir exame
router.delete('/:idExame', (req, res) => {
  const idExame = parseInt(req.params.idExame);
  db.query('DELETE FROM exames WHERE idExame = ?', [idExame], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    res.status(200).json({ message: 'Exame excluído com sucesso' });
  });
});

module.exports = router;
