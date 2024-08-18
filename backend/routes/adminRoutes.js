const express = require('express');
const { RoomLottery, UserLotteryEntry, User } = require('../models');
const verifyAdminToken = require('../middleware/adminAuthMiddleware');
const router = express.Router();

// Route to create a new lottery
router.post('/lotteries/create', verifyAdminToken, async (req, res) => {
  const { lottery_name, room_type, building, floor, max_applicants } = req.body;

  if (!lottery_name || !room_type || !building || !floor || !max_applicants) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const lottery = await RoomLottery.create({ lottery_name, room_type, building, floor, max_applicants });
    res.status(201).json(lottery);
  } catch (error) {
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

router.get('/lotteries/:lottery_id/applicants', verifyAdminToken, async (req, res) => {
  const { lottery_id } = req.params;

  try {
    const applicants = await UserLotteryEntry.findAll({
      where: { lottery_id },
      include: [
        {
          model: User,
          attributes: ['email', 'studentId'], // Pull email and studentId from User
        }
      ],
      // Specify the fields you want to include from the UserLotteryEntry model
      attributes: ['id', 'academic_status', 'athletic_status', 'room_preference', 'created_at'],
    });

    console.log('Fetched applicants:', JSON.stringify(applicants, null, 2)); // Log applicants data

    if (applicants.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this lottery.' });
    }

    res.json(applicants);
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// Route to delete an applicant from a specific lottery
router.delete('/lotteries/:lottery_id/applicants/:applicant_id', verifyAdminToken, async (req, res) => {
  const { applicant_id } = req.params;

  try {
    const applicant = await UserLotteryEntry.findByPk(applicant_id);

    if (!applicant) {
      return res.status(404).json({ error: 'Applicant not found' });
    }

    await applicant.destroy();
    res.json({ message: 'Applicant deleted' });
  } catch (error) {
    console.error('Failed to delete applicant:', error);
    res.status(500).json({ error: 'Failed to delete applicant' });
  }
});

module.exports = router;