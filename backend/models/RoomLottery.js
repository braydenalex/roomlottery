const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RoomLottery = sequelize.define('room_lottery', {
  lottery_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  room_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'pending',
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = RoomLottery;
