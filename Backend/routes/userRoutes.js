const express = require('express');
const User = require('../models/users');
const bcrypt = require('bcrypt');

const router = express.Router();

// Criar usuário
router.post('/createUsuario', async (req, res) => {
  const { name, email, password } = req.body;
  console.log('Dados recebidos no backend:', { name, email });

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, password: hashedPassword });
    console.log('Usuário criado com sucesso:', user);
    res.status(201).json(user);
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(400).json({ error: 'Erro ao criar usuário.' });
  }
});


// Listar todos os usuários
router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

module.exports = router;
