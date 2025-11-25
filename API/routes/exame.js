const express = require('express');
const router = express.Router();
const db = require('../db'); // pool promise (mysql2/promise)

// helper para transformar rows e aninhar paciente
function mapExameRow(row) {
  const paciente = {
    idPaciente: row.idPaciente,
    nome: row.nome,
    idade: row.idade,
    email: row.email
  };
  // copia restante do exame
  const { nome, idade, email, ...rest } = row;
  return { ...rest, paciente };
}

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
    const mapped = rows.map(mapExameRow);
    return res.json(mapped);
  } catch (err) {
    console.error('[API] erro GET /exames:', err);
    return res.status(500).json({ error: err.message || 'Erro ao buscar exames' });
  }
});

// Buscar exame por ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [rows] = await db.query(
      `SELECT e.idExame, e.idPaciente, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
              p.nome, p.idade, p.email
       FROM exames e LEFT JOIN pacientes p ON e.idPaciente = p.idPaciente
       WHERE e.idExame = ?`, [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Exame não encontrado' });
    return res.json(mapExameRow(rows[0]));
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
    const [pacRows] = await db.query('SELECT idPaciente, nome, idade, email FROM pacientes WHERE idPaciente = ?', [idPac]);
    if (!pacRows || pacRows.length === 0) {
      return res.status(404).json({ message: 'Paciente não encontrado' });
    }

    const dataVal = dataExame || new Date();
    const sql = `
      INSERT INTO exames (idPaciente, laboratorio, exameTexto, dataExame, resultado, informacoesAdicionais)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const infoStr = informacoesAdicionais ? (typeof informacoesAdicionais === 'string' ? informacoesAdicionais : JSON.stringify(informacoesAdicionais)) : null;
    const params = [idPac, laboratorio, exameTexto, dataVal, resultado || null, infoStr];

    const [result] = await db.query(sql, params);
    const insertedId = result.insertId;

    const [rows] = await db.query(
      `SELECT e.idExame, e.idPaciente, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
              p.nome, p.idade, p.email
       FROM exames e LEFT JOIN pacientes p ON e.idPaciente = p.idPaciente
       WHERE e.idExame = ?`,
      [insertedId]
    );

    return res.status(201).json(mapExameRow(rows[0]));
  } catch (err) {
    console.error('[API] erro POST /exames:', err);
    return res.status(500).json({ error: err.message || 'Erro ao criar exame' });
  }
});

// Editar exame
router.put('/:id', async (req, res) => {
  const idExame = parseInt(req.params.id, 10);
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
    const infoStr = informacoesAdicionais ? (typeof informacoesAdicionais === 'string' ? informacoesAdicionais : JSON.stringify(informacoesAdicionais)) : null;
    const sql = `
      UPDATE exames 
      SET idPaciente=?, laboratorio=?, exameTexto=?, dataExame=?, resultado=?, informacoesAdicionais=?
      WHERE idExame=?
    `;
    const params = [idPac, laboratorio, exameTexto, dataExame, resultado, infoStr, idExame];
    const [result] = await db.query(sql, params);

    if (result.affectedRows === 0) return res.status(404).json({ message: 'Exame não encontrado' });

    // retornar exame atualizado com paciente
    const [rows] = await db.query(
      `SELECT e.idExame, e.idPaciente, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
              p.nome, p.idade, p.email
       FROM exames e LEFT JOIN pacientes p ON e.idPaciente = p.idPaciente
       WHERE e.idExame = ?`,
      [idExame]
    );

    return res.json(mapExameRow(rows[0]));
  } catch (err) {
    console.error('[API] erro PUT /exames/:id', err);
    return res.status(500).json({ error: err.message });
  }
});

// Excluir exame (melhor tratamento de erros e resposta JSON)
router.delete('/:id', async (req, res) => {
  const idExame = parseInt(req.params.id, 10);
  if (isNaN(idExame)) {
    return res.status(400).json({ error: 'ID de exame inválido' });
  }

  try {
    console.log('[API] DELETE /exames/:id chamado para id =', idExame);
    const [result] = await db.query('DELETE FROM exames WHERE idExame = ?', [idExame]);

    if (!result || result.affectedRows === 0) {
      console.log('[API] DELETE -> nenhum registro removido para id:', idExame);
      return res.status(404).json({ message: 'Exame não encontrado' });
    }

    console.log('[API] DELETE -> sucesso, id removido:', idExame);
    // retornar JSON para facilitar debug no cliente
    return res.status(200).json({ deleted: true, id: idExame });
  } catch (err) {
    console.error('[API] erro DELETE /exames/:id', err);
    // tratar erro de FK (registro referenciado)
    if (err && (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451)) {
      return res.status(409).json({ error: 'Não foi possível excluir: registro referenciado por outra tabela (restrição de FK).' });
    }
    return res.status(500).json({ error: err.message || 'Erro ao excluir exame' });
  }
});

module.exports = router;
