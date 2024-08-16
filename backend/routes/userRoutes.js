const express = require('express');
const { User } = require('../models');
const verifyToken = require('../middleware/authMiddleware');
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

module.exports = router;