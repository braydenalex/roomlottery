const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const RoomLottery = require('./RoomLottery');

const UserLotteryEntry = sequelize.define('user_lottery_entry', {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lottery_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  room_preference: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  academic_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  athletic_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'user_lottery_entry'
});

UserLotteryEntry.belongsTo(User, { foreignKey: 'user_id' });
UserLotteryEntry.belongsTo(RoomLottery, { foreignKey: 'lottery_id' });

module.exports = UserLotteryEntry;