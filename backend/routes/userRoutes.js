const express = require('express');
const { Op } = require('sequelize');
const verifyToken = require('../middleware/authMiddleware');
const { User, UserLotteryEntry, RoomLottery, LotteryRoomType } = require('../models');
const router = express.Router();

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['email', 'studentId'], // Include all required fields
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the user is an admin by querying the admin table or adding the `isAdmin` flag
    const isAdmin = req.user.isAdmin;

    res.json({ ...user.toJSON(), isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

router.get('/my-lotteries', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const enteredLotteries = await UserLotteryEntry.findAll({
      where: { user_id: userId },
      include: [{
        model: RoomLottery,
        as: 'room_lottery',
        include: [{
          model: LotteryRoomType,
          as: 'room_types',
          attributes: ['id', 'room_type', 'max_applicants'],
        }],
        attributes: ['id', 'lottery_name', 'building', 'floor', 'status'],
      }],
    });

    res.json(enteredLotteries);
  } catch (error) {
    console.error('Error fetching entered lotteries:', error);
    res.status(500).json({ error: 'Failed to fetch entered lotteries' });
  }
});

// Get room types for a specific lottery
router.get('/lotteries/:lottery_id/room-types', verifyToken, async (req, res) => {
  const { lottery_id } = req.params;

  try {
    const roomTypes = await LotteryRoomType.findAll({
      where: { lottery_id },
    });

    if (!roomTypes.length) {
      return res.status(404).json({ error: 'No room types found for this lottery' });
    }

    res.json(roomTypes);
  } catch (error) {
    console.error('Error fetching room types:', error);
    res.status(500).json({ error: 'Failed to fetch room types' });
  }
});

// Get available lotteries for user to enter
router.get('/available-lotteries', verifyToken, async (req, res) => {
  try {
    const userEntries = await UserLotteryEntry.findAll({ where: { user_id: req.user.id } });
    const enteredLotteryIds = userEntries.map(entry => entry.lottery_id);

    const availableLotteries = await RoomLottery.findAll({
      where: {
        id: { [Op.notIn]: enteredLotteryIds },
        status: 'Open',
      },
      include: [{
        model: LotteryRoomType,
        as: 'room_types',  // Ensure alias matches the model definition
        attributes: ['id', 'room_type', 'max_applicants'],
      }],
    });

    res.json(availableLotteries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve available lotteries' });
  }
});

// Route to enter a lottery
router.post('/enter-lottery/:lottery_id', verifyToken, async (req, res) => {
  const { lottery_id } = req.params;
  const { room_preference, academic_status, athletic_status } = req.body;

  try {
    // Check if the user is already entered in a lottery
    const existingEntry = await UserLotteryEntry.findOne({ where: { user_id: req.user.id } });
    if (existingEntry) {
      return res.status(400).json({ error: 'You are already entered in a lottery' });
    }

    // Fetch the room types and calculate total available spots
    const roomTypes = await LotteryRoomType.findAll({ where: { lottery_id } });
    const totalAvailableSpots = roomTypes.reduce((total, roomType) => total + roomType.max_applicants, 0);

    // Fetch the current number of users entered in this lottery
    const currentEntriesCount = await UserLotteryEntry.count({ where: { lottery_id } });

    // Prevent entry if the total entries exceed available spots
    if (currentEntriesCount >= totalAvailableSpots) {
      return res.status(400).json({ error: 'No more spots available in this lottery.' });
    }

    // If spots are available, allow the user to enter the lottery
    const entry = await UserLotteryEntry.create({
      user_id: req.user.id,
      lottery_id,
      room_preference,
      academic_status,
      athletic_status,
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error('Error entering lottery:', error);
    res.status(500).json({ error: 'Failed to enter lottery' });
  }
});

module.exports = router;