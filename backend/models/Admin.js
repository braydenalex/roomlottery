const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Admin = sequelize.define('admin', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Admin;