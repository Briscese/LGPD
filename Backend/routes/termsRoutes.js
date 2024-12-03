const express = require('express');
const Terms = require('../models/terms');

const router = express.Router();

// Rota para obter todos os termos
router.get('/', async (req, res) => {
  try {
    const terms = await Terms.findAll({ order: [['createdAt', 'ASC']] }); // Ordena por data de criação
    res.json(terms);
  } catch (err) {
    console.error('Erro ao buscar termos:', err);
    res.status(500).json({ error: 'Erro ao buscar termos.' });
  }
});

module.exports = router;
