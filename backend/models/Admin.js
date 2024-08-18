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
  updatedAt: 'updated_at'
});

module.exports = Admin;