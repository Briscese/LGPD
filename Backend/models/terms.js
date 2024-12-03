const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Terms = sequelize.define('Terms', {
  version: { type: DataTypes.STRING, allowNull: false, unique: false },
  content: { type: DataTypes.TEXT, allowNull: false },
}, { timestamps: true }); // Adiciona createdAt e updatedAt

module.exports = Terms;
