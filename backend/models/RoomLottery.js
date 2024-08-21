const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const LotteryRoomType = require('./LotteryRoomType');

const RoomLottery = sequelize.define('room_lottery', {
  lottery_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
    allowNull: false,
  },
  building: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  floor: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'room_lotteries',
});

// Setting the alias 'room_types' for the association
RoomLottery.hasMany(LotteryRoomType, { foreignKey: 'lottery_id', as: 'room_types' });
LotteryRoomType.belongsTo(RoomLottery, { foreignKey: 'lottery_id' });

RoomLottery.associate = function(models) {
  RoomLottery.hasMany(models.UserLotteryEntry, { foreignKey: 'lottery_id' });
};

module.exports = RoomLottery;