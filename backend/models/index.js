const User = require('./User');
const Admin = require('./Admin');
const ApprovedStudentId = require('./ApprovedStudentId');
const RoomLottery = require('./RoomLottery');
const UserLotteryEntry = require('./UserLotteryEntry')

const models = {
  User,
  Admin,
  ApprovedStudentId,
  RoomLottery,
  UserLotteryEntry,
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
  UserLotteryEntry
};
