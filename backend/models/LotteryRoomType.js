const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class LotteryRoomType extends Model {}

LotteryRoomType.init({
  lottery_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'RoomLottery',
      key: 'id'
    },
  },
  room_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  max_applicants: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'LotteryRoomType',
  tableName: 'lottery_room_types',
  underscored: true
});

module.exports = LotteryRoomType;