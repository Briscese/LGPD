const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Função para criar/verificar o banco de dados
const createDatabase = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

    // Cria o banco principal se não existir
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Banco de dados '${process.env.DB_NAME}' verificado/criado com sucesso.`);

    // Cria o banco de excluídos se não existir
    await connection.query('CREATE DATABASE IF NOT EXISTS lgpd_excluded_db');
    console.log(`Banco de dados 'lgpd_excluded_db' verificado/criado com sucesso.`);

    connection.end();
  } catch (err) {
    console.error('Erro ao verificar/criar os bancos de dados:', err);
    process.exit(1);
  }
};


const excludedDb = new Sequelize(
  'lgpd_excluded_db', // Nome do banco de dados
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

// Configuração do Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);

module.exports = { sequelize, createDatabase , excludedDb};
