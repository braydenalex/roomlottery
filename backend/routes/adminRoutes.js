const express = require('express');
const { RoomLottery, LotteryRoomType, UserLotteryEntry, User } = require('../models');
const verifyAdminToken = require('../middleware/adminAuthMiddleware');
const router = express.Router();

// Route to create a new lottery with multiple room types
router.post('/lotteries/create', verifyAdminToken, async (req, res) => {
  const { lottery_name, building, floor, room_types } = req.body;

  if (!lottery_name || !building || !floor || !room_types || room_types.length === 0) {
    return res.status(400).json({ error: 'All fields are required, including room types' });
  }

  try {
    // Create the main lottery in the room_lottery table
    const lottery = await RoomLottery.create({ 
      lottery_name, 
      building, 
      floor 
    });

    // Loop through and create each room type associated with the lottery
    for (const roomType of room_types) {
      await LotteryRoomType.create({
        lottery_id: lottery.id,
        room_type: roomType.room_type,
        max_applicants: roomType.max_applicants,
      });
    }

    res.status(201).json({ message: 'Lottery and room types created successfully', lottery });
  } catch (error) {
    console.error('Failed to create lottery:', error);
    res.status(500).json({ error: 'Failed to create lottery' });
  }
});

// Route to get all lotteries including their room types
router.get('/lotteries/all', verifyAdminToken, async (req, res) => {
  try {
    const lotteries = await RoomLottery.findAll({
      include: [{ model: LotteryRoomType, as: 'room_types' }]
    });
    res.json(lotteries);
  } catch (error) {
    console.error('Failed to retrieve lotteries:', error);
    res.status(500).json({ error: 'Failed to retrieve lotteries' });
  }
});

// Route to get a single lottery by ID including its room types
router.get('/lotteries/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    const lottery = await RoomLottery.findByPk(id, {
      include: [{ model: LotteryRoomType, as: 'room_types' }],
    });
    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }
    res.json(lottery);
  } catch (error) {
    console.error('Failed to retrieve lottery:', error);
    res.status(500).json({ error: 'Failed to retrieve lottery' });
  }
});

// Route to update a lottery with multiple room types
router.put('/lotteries/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  const { lottery_name, building, floor, room_types, status } = req.body;

  try {
    const lottery = await RoomLottery.findByPk(id);
    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    // Force status update
    if (status !== undefined && status !== '') {
      lottery.status = status; // Explicitly set the new status
    }

    // Update other fields
    if (lottery_name !== undefined) lottery.lottery_name = lottery_name;
    if (building !== undefined) lottery.building = building;
    if (floor !== undefined) lottery.floor = floor;

    await lottery.save();  // Ensure that changes are saved

    // Process room types (same as before)
    if (Array.isArray(room_types) && room_types.length > 0) {
      await LotteryRoomType.destroy({ where: { lottery_id: id } });
      for (const roomType of room_types) {
        await LotteryRoomType.create({
          lottery_id: id,
          room_type: roomType.room_type,
          max_applicants: roomType.max_applicants,
        });
      }
    }

    res.json({ message: 'Lottery and room types updated successfully', lottery });
  } catch (error) {
    console.error('Failed to update lottery:', error);
    res.status(500).json({ error: 'Failed to update lottery' });
  }
});

// Route to delete a lottery
router.delete('/lotteries/:id', verifyAdminToken, async (req, res) => {
  const { id } = req.params;

  try {
    const lottery = await RoomLottery.findByPk(id);
    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    const hasApplicants = await UserLotteryEntry.findOne({ where: { lottery_id: id } });
    if (hasApplicants) {
      return res.status(400).json({ error: 'Cannot delete a lottery that has applicants. Please remove the applicants first.' });
    }

    await LotteryRoomType.destroy({ where: { lottery_id: id } }); // Delete associated room types
    await lottery.destroy(); // Delete the lottery

    res.json({ message: 'Lottery deleted successfully' });
  } catch (error) {
    console.error('Failed to delete lottery:', error);
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

router.post('/lotteries/:id/select-winners', verifyAdminToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    const lottery = await RoomLottery.findByPk(id, {
      include: [{ model: LotteryRoomType, as: 'room_types' }]
    });

    if (!lottery) {
      return res.status(404).json({ error: 'Lottery not found' });
    }

    const applicants = await UserLotteryEntry.findAll({
      where: { lottery_id: id },
      include: [{ model: User, attributes: ['email', 'studentId'] }],
      order: [
        ['athletic_status', 'DESC'],  // Athletes first
        ['academic_status', 'DESC'],  // Honors students next
        ['created_at', 'ASC'],        // Then by time of entry
      ],
    });

    if (applicants.length === 0) {
      return res.status(404).json({ message: 'No applicants found for this lottery.' });
    }

    // Map room types to their availability
    const roomAvailability = {};
    for (const roomType of lottery.room_types) {
      roomAvailability[roomType.room_type] = roomType.max_applicants;
    }

    const winners = [];
    
    for (const applicant of applicants) {
      const preferredRoom = applicant.room_preference;

      // Check if there are spots available for the preferred room type
      if (roomAvailability[preferredRoom] > 0) {
        winners.push(applicant);
        roomAvailability[preferredRoom] -= 1;  // Decrement available spots
      }

      // Stop once there are no more rooms left to allocate
      if (Object.values(roomAvailability).every(spots => spots === 0)) {
        break;
      }
    }

    res.json({ winners });
  } catch (error) {
    console.error('Failed to select winners:', error);
    res.status(500).json({ error: 'Failed to select winners' });
  }
});


module.exports = router;