const User = require('./User');
const Admin = require('./Admin');
const ApprovedStudentId = require('./ApprovedStudentId');
const RoomLottery = require('./RoomLottery');
const UserLotteryEntry = require('./UserLotteryEntry');
const LotteryRoomType = require('./LotteryRoomType');

const models = {
  User,
  Admin,
  ApprovedStudentId,
  RoomLottery,
  UserLotteryEntry,
  LotteryRoomType
}

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  User,
  Admin,
  ApprovedStudentId,
  RoomLottery,
  UserLotteryEntry,
  LotteryRoomType
};
