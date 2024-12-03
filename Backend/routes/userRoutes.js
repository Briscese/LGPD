const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/users');
const UserTerms = require('../models/user_terms');
const Terms = require('../models/terms');
const jwt = require('jsonwebtoken');
const ExcludedUsers = require('../models/excluded_users');

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

// Login do usuário
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca o usuário pelo email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Verifica se o ID do usuário está na tabela ExcludedUsers
    const excludedUser = await ExcludedUsers.findOne({ where: { userId: user.id } });
    if (excludedUser) {
      // Remove os registros relacionados na tabela UserTerms
      await UserTerms.destroy({ where: { userId: user.id } });

      // Exclui o usuário da tabela Users
      await user.destroy();

      return res.status(403).json({
        error: 'Conta excluída. Por favor, crie uma nova conta para acessar.',
      });
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    // Gera um token JWT para autenticação
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Busca os termos aceitos pelo usuário
    const userTerms = await UserTerms.findAll({
      where: { userId: user.id },
      include: [{ model: Terms }],
    });

    const acceptedTerms = userTerms.map((ut) => ({
      id: ut.Term.id,
      content: ut.Term.content,
      version: ut.Term.version,
      mandatory: ut.Term.mandatory,
    }));

    res.status(200).json({
      token,
      user: {
        name: user.name,
        email: user.email,
        acceptedTerms,
      },
    });
  } catch (err) {
    console.error('Erro ao realizar login:', err);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
});




// Obter os dados do usuário
router.get('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const userTerms = await UserTerms.findAll({
      where: { userId: user.id },
      include: [{ model: Terms }],
    });

    const acceptedTerms = userTerms.map((ut) => ({
      id: ut.Term.id,
      content: ut.Term.content,
      version: ut.Term.version,
      mandatory: ut.Term.mandatory,
    }));

    res.status(200).json({
      id: user.id, // Adiciona ID para facilitar exclusão no frontend
      name: user.name,
      email: user.email,
      acceptedTerms,
    });
  } catch (err) {
    console.error('Erro ao buscar dados do usuário:', err);
    res.status(401).json({ error: 'Token inválido.' });
  }
});


// Rota para deletar o usuário
router.delete('/deleteUser/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Verifica se o usuário existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Remove os registros relacionados na tabela UserTerms
    await UserTerms.destroy({ where: { userId } });

    // Verifica se o ID já existe na tabela ExcludedUsers
    const existingExcluded = await ExcludedUsers.findOne({ where: { userId } });
    if (!existingExcluded) {
      // Adiciona o ID do usuário à tabela ExcludedUsers
      await ExcludedUsers.create({ userId });
    }

    // Exclui o usuário da tabela Users
    await user.destroy();

    res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar usuário:', err);
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
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
