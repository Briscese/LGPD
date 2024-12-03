const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Terms = sequelize.define('Terms', {
  version: { type: DataTypes.STRING, allowNull: false, unique: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  mandatory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }, // Nova coluna
}, { timestamps: true });

module.exports = Terms;
