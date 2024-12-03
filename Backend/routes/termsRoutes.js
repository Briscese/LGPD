const express = require('express');
const Terms = require('../models/terms');

const router = express.Router();

// Rota para obter os termos da versão mais recente
router.get('/pegartermos', async (req, res) => {
  try {
    const latestVersion = await Terms.findOne({
      attributes: ['version'],
      order: [['createdAt', 'DESC']],
    });

    if (!latestVersion) {
      return res.status(404).json({ error: 'Nenhuma versão de termos encontrada.' });
    }

    const terms = await Terms.findAll({
      where: { version: latestVersion.version },
      order: [['createdAt', 'ASC']],
    });

    res.json(terms);
  } catch (err) {
    console.error('Erro ao buscar os termos:', err);
    res.status(500).json({ error: 'Erro ao buscar os termos.' });
  }
});


module.exports = router;
