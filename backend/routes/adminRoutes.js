const express = require('express');
const { RoomLottery } = require('../models');
const verifyAdminToken = require('../middleware/adminAuthMiddleware'); // Correct middleware for admin verification
const router = express.Router();

// Route to create a new lottery
router.post('/lotteries/create', verifyAdminToken, async (req, res) => {
  const { lottery_name, room_type } = req.body;

  if (!lottery_name || !room_type) {
    return res.status(400).json({ error: 'Lottery name and room type are required' });
  }

  try {
    const lottery = await RoomLottery.create({ lottery_name, room_type });
    res.status(201).json(lottery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create lottery' });
  }
});

// Route to get all lotteries
router.get('/lotteries/all', verifyAdminToken, async (req, res) => {
  try {
    const lotteries = await RoomLottery.findAll();
    res.json(lotteries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve lotteries' });
  }
});

// Route to get a single lottery by ID
router.get('/lotteries/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    const lottery = await RoomLottery.findByPk(id);
    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }
    res.json(lottery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve lottery' });
  }
});

router.put('/lotteries/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { lottery_name, room_type, status } = req.body;

  try {
    const lottery = await RoomLottery.findByPk(id);
    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    // Only update fields that are present in the request
    if (lottery_name !== undefined) lottery.lottery_name = lottery_name;
    if (room_type !== undefined) lottery.room_type = room_type;
    if (status !== undefined) lottery.status = status;

    await lottery.save();
    res.json(lottery);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update lottery' });
  }
});

// Route to delete a lottery by ID
router.delete('/lotteries/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    const lottery = await RoomLottery.findByPk(id);
    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    await lottery.destroy();
    res.json({ message: 'Lottery deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete lottery' });
  }
});

module.exports = router;