const express = require('express');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');

// ======= ROTA PARA GERAR PDF DE UM EXAME =======
router.get('/:id/pdf', async (req, res) => {
  const idExame = parseInt(req.params.id, 10);

  try {
    // Buscar o exame no banco
    const [rows] = await db.query(
      `SELECT e.idExame, e.idPaciente, e.laboratorio, e.exameTexto, e.dataExame, e.resultado, e.informacoesAdicionais,
              p.nome AS pacienteNome, p.idade AS pacienteIdade, p.email AS pacienteEmail
       FROM exames e
       LEFT JOIN pacientes p ON e.idPaciente = p.idPaciente
       WHERE e.idExame = ?`,
      [idExame]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Exame não encontrado' });
    }

    const exame = rows[0];

    // Criar PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Configurar cabeçalho
    doc.fontSize(20).text('Laudo de Exame', { align: 'center' });
    doc.moveDown();
    
    // Informações do paciente
    doc.fontSize(14).text(`Paciente: ${exame.pacienteNome}`);
    doc.text(`Idade: ${exame.pacienteIdade}`);
    doc.text(`Email: ${exame.pacienteEmail}`);
    doc.moveDown();

    // Informações do exame
    doc.text(`Exame ID: ${exame.idExame}`);
    doc.text(`Laboratório: ${exame.laboratorio}`);
    doc.text(`Data do Exame: ${new Date(exame.dataExame).toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(16).text('Resultado:', { underline: true });
    doc.fontSize(12).text(exame.resultado || 'Sem resultado registrado');
    doc.moveDown();

    if (exame.informacoesAdicionais) {
      doc.fontSize(16).text('Informações Adicionais:', { underline: true });
      doc.fontSize(12).text(exame.informacoesAdicionais);
      doc.moveDown();
    }

    // Configurar cabeçalho de resposta HTTP para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=exame_${exame.idExame}.pdf`);

    // Enviar PDF para o cliente
    doc.pipe(res);
    doc.end();

  } catch (err) {
    console.error('Erro ao gerar PDF do exame:', err);
    return res.status(500).json({ message: 'Erro ao gerar PDF' });
  }
});

module.exports = router;
