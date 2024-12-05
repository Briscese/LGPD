const express = require('express');
const Terms = require('../models/terms');
const jwt = require('jsonwebtoken');
const User = require('../models/users');
const UserTerms = require('../models/user_terms');

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
      where: { isActive: true},
      order: [['createdAt', 'ASC']],
    });

    res.json(terms);
  } catch (err) {
    console.error('Erro ao buscar os termos:', err);
    res.status(500).json({ error: 'Erro ao buscar os termos.' });
  }
});


// Rota para atualizar os termos aceitos por um usuário (alterar a tabela userterms)
router.put('/atualizartermos', async (req, res) => {

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.warn('Token não fornecido.');
      return res.status(401).json({ error: 'Token não fornecido.' });
    }

    // Verificação e decodificação do token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('Erro ao verificar o token:', err);
      return res.status(401).json({ error: 'Token inválido.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.warn('Usuário não encontrado:', decoded.id);
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // IDs dos termos diretamente no body
    const termsId = req.body; // O body é diretamente o array de IDs
    console.log ("body:" + JSON.stringify(termsId))
    if (!Array.isArray(termsId) || termsId.some((id) => typeof id !== 'number')) {
      console.warn('IDs dos termos não fornecidos ou inválidos.');
      return res
        .status(400)
        .json({ error: 'O corpo deve ser um array de números.' });
    }

    console.log('IDs de termos recebidos:', termsId);

    // Desativar todos os registros antigos para o usuário
    console.log('Desativando registros antigos para o usuário:', user.id);
    await UserTerms.update(
      { isActive: false },
      { where: { userId: user.id, isActive: true } }
    );

    // Criar novos registros para os termos
    const newTerms = termsId.map((id) => ({
      userId: user.id,
      termsId: id,
      isActive: true,
      acceptedAt: new Date(),
    }));

    console.log('Novos termos a serem criados:', newTerms);

    await UserTerms.bulkCreate(newTerms);

    console.log('Termos atualizados com sucesso para o usuário:', user.id);
    res.json({ message: 'Termos atualizados com sucesso.' });
  } catch (err) {
    console.error('Erro ao atualizar os termos:', err);
    res.status(500).json({ error: 'Erro ao atualizar os termos.' });
  }
});

// Rota para cadastrar novos termos
router.post('/cadastrartermos', async (req, res) => {
  try {
    const newTerms = req.body;

    // Verifica se o body contém um array de termos
    if (!Array.isArray(newTerms) || newTerms.length === 0) {
      return res.status(400).json({ error: 'O corpo deve ser um array de termos.' });
    }

    // Desativa todos os termos ativos atuais
    await Terms.update(
      { isActive: false },
      { where: { isActive: true } }
    );

    // Cria os novos termos com isActive = true
    for (const term of newTerms) {
      if (!term.version || !term.content || typeof term.mandatory !== 'boolean') {
        return res.status(400).json({ error: 'Termo com dados inválidos.' });
      }

      await Terms.create({
        version: term.version,
        content: term.content,
        mandatory: term.mandatory,
        isActive: true,
      });
    }

    return res.status(201).json({ message: 'Termos cadastrados com sucesso!' });
  } catch (err) {
    console.error('Erro ao cadastrar os termos:', err);
    return res.status(500).json({ error: 'Erro interno ao cadastrar os termos.' });
  }
});

// Rota para obter os termos aceitos por um usuário específico
router.get('/termos-aceitos', async (req, res) => {
  try {
    // Pega o token do cabeçalho Authorization
    const token = req.headers['authorization']?.split(' ')[1]; // Assumindo que o token está no formato "Bearer <token>"

    // Se não houver token, retorna erro
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido.' });
    }

    // Verifica e decodifica o token para obter o userId
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET); // Substitua 'JWT_SECRET' pela chave do seu JWT
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido.' });
    }

    const userId = decoded.id; // O ID do usuário vem do payload do token

    // Busca os termos aceitos pelo usuário
    const userTerms = await UserTerms.findAll({
      where: {
        userId: userId, // Filtra pelos termos do usuário
        isActive: true, // Filtra apenas os termos ativos
      },
      include: [
        {
          model: Terms, // Junta com a tabela de termos
          attributes: ['id', 'content'], // Seleciona o conteúdo dos termos
        },
      ],
      order: [['acceptedAt', 'ASC']], // Ordena pelos horários de aceitação
    });

    // Verifica se o usuário aceitou termos
    if (userTerms.length === 0) {
      return res.status(404).json({ message: 'Nenhum termo encontrado para esse usuário.' });
    }

    // Formata a resposta com os termos, o conteúdo e os horários em que foram aceitos
    const acceptedTerms = userTerms.map((userTerm) => ({
      termId: userTerm.termsId,
      termContent: userTerm.Term.content, // Acessa o conteúdo do termo
      acceptedAt: userTerm.acceptedAt, // Horário que o termo foi aceito
    }));

    // Envia a resposta com os termos aceitos
    return res.status(200).json({ acceptedTerms });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao buscar os termos aceitos.' });
  }
});

module.exports = router;
