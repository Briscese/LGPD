const express = require('express');
const dotenv = require('dotenv');
const { sequelize, createDatabase } = require('./config/database');
const userRoutes = require('./routes/userRoutes');

dotenv.config();

const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());

// Criar/verificar o banco e sincronizar os modelos
(async () => {
  try {
    await createDatabase(); // Verifica/cria o banco
    await sequelize.authenticate(); // Conecta ao banco
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Importar os modelos antes de sincronizar
    const User = require('./models/users');
    const Terms = require('./models/terms');
    const UserTerms = require('./models/user_terms');

    await sequelize.sync(); // Sincroniza os modelos
    console.log('Tabelas sincronizadas com sucesso.');
  } catch (err) {
    console.error('Erro ao configurar o banco de dados:', err);
    process.exit(1);
  }
})();

// Rotas
app.use('/users', userRoutes);

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
