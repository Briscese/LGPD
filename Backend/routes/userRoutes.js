const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const UserTerms = require('../models/user_terms');
const Terms = require('../models/terms'); // Certifique-se de que o modelo foi importado

const router = express.Router();

// Criar usuário e associar aos termos
router.post('/createUsuario', async (req, res) => {
  const { name, email, password, acceptedTerms } = req.body;
  console.log('Dados recebidos no backend:', { name, email, acceptedTerms });

  try {
    // Obter os IDs dos termos obrigatórios
    const mandatoryTerms = await Terms.findAll({ where: { mandatory: true } });
    const mandatoryTermIds = mandatoryTerms.map((term) => term.id);

    console.log('IDs dos termos obrigatórios:', mandatoryTermIds);

    // Verifica se todos os termos obrigatórios foram aceitos
    const hasAcceptedMandatoryTerms = mandatoryTermIds.every((id) =>
      acceptedTerms.includes(id)
    );

    console.log('Aceitou todos os termos obrigatórios?', hasAcceptedMandatoryTerms);

    if (!hasAcceptedMandatoryTerms) {
      return res
        .status(400)
        .json({ error: 'Você deve aceitar todos os termos obrigatórios.' });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar o usuário
    const user = await User.create({ name, email, password: hashedPassword });
    console.log('Usuário criado com sucesso:', user);

    // Associar o usuário aos termos aceitos
    const userTerms = acceptedTerms.map((termId) => ({
      userId: user.id,
      termsId: termId,
    }));

    await UserTerms.bulkCreate(userTerms);
    console.log('Termos associados ao usuário:', userTerms);

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
