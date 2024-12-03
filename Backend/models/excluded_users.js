const { DataTypes } = require('sequelize');
const { excludedDb } = require('../config/database');

const ExcludedUsers = excludedDb.define('ExcludedUsers', {
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true }, // ID do usuário excluído
}, { timestamps: true }); // Adiciona createdAt e updatedAt para registrar quando foi excluído

module.exports = ExcludedUsers;