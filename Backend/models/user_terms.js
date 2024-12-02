const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./users');
const Terms = require('./terms');

const UserTerms = sequelize.define('UserTerms', {
  userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: 'id' } },
  termsId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Terms, key: 'id' } },
  acceptedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
}, { timestamps: false }); // Não precisa de createdAt/updatedAt

UserTerms.belongsTo(User, { foreignKey: 'userId' });
UserTerms.belongsTo(Terms, { foreignKey: 'termsId' });

module.exports = UserTerms;
