const express = require('express');
const dotenv = require('dotenv');
const { sequelize, createDatabase } = require('./config/database');
const User = require('./models/users');
const Terms = require('./models/terms');
const UserTerms = require('./models/user_terms');
const ExcludedUsers = require('./models/excluded_users'); // Para o banco de excluídos
const { excludedDb } = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const termsRoutes = require('./routes/termsRoutes'); // Importa as rotas de termos

dotenv.config();

const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

// Termos da LGPD - Versão 1
const initialTerms = [
  {
    version: '1.0',
    content: 'Eu concordo com a coleta e o armazenamento dos meus dados pessoais conforme as finalidades descritas na política de privacidade.',
    mandatory: true,
  },
  {
    version: '1.0',
    content: 'Eu autorizo o compartilhamento dos meus dados pessoais com terceiros estritamente para a execução dos serviços contratados.',
    mandatory: true,
  },
  {
    version: '1.0',
    content: 'Eu aceito receber ofertas, promoções e comunicações relacionadas aos produtos e serviços oferecidos.',
    mandatory: false,
  },
  {
    version: '1.0',
    content: 'Eu autorizo a utilização dos meus dados para personalização da minha experiência de uso no sistema.',
    mandatory: false,
  },
];

// Criar/verificar os bancos e sincronizar os modelos
(async () => {
  try {
    await createDatabase();

    // Conectar aos bancos
    await sequelize.authenticate();
    await excludedDb.authenticate();
    console.log('Conexão com os bancos estabelecida.');

    // Sincronizar os modelos do banco principal
    await sequelize.sync({ alter: true });
    console.log('Tabelas do banco principal sincronizadas.');

    // Sincronizar os modelos do banco de excluídos
    await excludedDb.sync({ alter: true });
    console.log('Tabelas do banco de excluídos sincronizadas.');

    // Inserir os termos da LGPD
    for (const term of initialTerms) {
      const [record, created] = await Terms.findOrCreate({
        where: { content: term.content, version: term.version },
        defaults: term,
      });

      if (created) {
        console.log(`Termo inserido: "${record.content}"`);
      } else {
        console.log(`Termo já existente: "${record.content}"`);
      }
    }

    console.log('Termos da LGPD inseridos com sucesso.');
  } catch (err) {
    console.error('Erro ao configurar os bancos de dados:', err);
    process.exit(1);
  }
})();

// Rotas
app.use('/users', userRoutes);
app.use('/terms', termsRoutes); // Agora usa termsRoutes corretamente

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
