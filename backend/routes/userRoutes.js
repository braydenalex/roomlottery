const express = require('express');
const { Op } = require('sequelize');
const verifyToken = require('../middleware/authMiddleware');
const { User, UserLotteryEntry, RoomLottery } = require('../models');
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
    const isAdmin = req.user.isAdmin;  // Assuming the `isAdmin` flag is added when issuing the token

    // Respond with user data and `isAdmin` flag
    res.json({ ...user.toJSON(), isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve user data' });
  }
});

// Get lotteries a user is entered in
router.get('/my-lotteries', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const enteredLotteries = await UserLotteryEntry.findAll({
      where: { user_id: userId },
      include: [
        {
          model: RoomLottery, // Link RoomLottery based on lottery_id in UserLotteryEntry
          attributes: ['lottery_name', 'building', 'floor', 'room_type'],
          foreignKey: 'id', // This ensures that lottery_id in user_lottery_entry is matched with id in room_lotteries
        },
      ],
    });

    res.json(enteredLotteries);
  } catch (error) {
    console.error('Error fetching entered lotteries:', error);
    res.status(500).json({ error: 'Failed to fetch entered lotteries' });
  }
});

// Get available lotteries for user to enter
router.get('/available-lotteries', verifyToken, async (req, res) => {
  try {
    const userEntries = await UserLotteryEntry.findAll({ where: { user_id: req.user.id } });

    // Get IDs of lotteries the user has already entered
    const enteredLotteryIds = userEntries.map(entry => entry.lottery_id);

    // Fetch lotteries that the user hasn't entered
    const availableLotteries = await RoomLottery.findAll({
      where: {
        id: { [Op.notIn]: enteredLotteryIds },
        status: 'Open' // Ensure the lottery is open for entry
      }
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

  // Ensure the user doesn't enter more than one lottery
  const existingEntry = await UserLotteryEntry.findOne({ where: { user_id: req.user.id } });
  if (existingEntry) {
    return res.status(400).json({ error: 'You are already entered in a lottery' });
  }

  try {
    const entry = await UserLotteryEntry.create({
      user_id: req.user.id,
      lottery_id,
      room_preference,
      academic_status,
      athletic_status,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to enter lottery' });
  }
});

module.exports = router;