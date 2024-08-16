const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ApprovedStudentId = sequelize.define('approved_student_ids', {
  student_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  timestamps: false
});

module.exports = ApprovedStudentId;
