const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Terms = sequelize.define('Terms', {
  version: { type: DataTypes.STRING, allowNull: false, unique: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  mandatory: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { timestamps: true });

module.exports = Terms;