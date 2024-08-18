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
    defaultValue: 'Pending',
  },
  building: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  max_applicants: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'room_lotteries',
});

RoomLottery.associate = function(models) {
  RoomLottery.hasMany(models.UserLotteryEntry, { foreignKey: 'lottery_id' });
};

module.exports = RoomLottery;