const express = require('express');
const User = require('../models/users');
const bcrypt = require('bcrypt');
const sendEmailsToUsers = require('../emailSender');

const router = express.Router();

// Criar usuário
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Erro ao criar usuário.' });
  }
});

// Listar todos os usuários
router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// Rota para enviar e-mails a todos os usuários
router.post('/enviar-emails', async (req, res) => {
  try {
    await sendEmailsToUsers();
    res.status(200).json({ message: 'Emails enviados com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mails:', error);
    res.status(500).json({ message: 'Erro ao enviar e-mails', error: error.message });
  }
});

module.exports = router;
