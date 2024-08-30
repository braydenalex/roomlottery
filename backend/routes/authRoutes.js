const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Admin, ApprovedStudentId } = require('../models');
const router = express.Router();

// Rate limiter for login route
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes."
});

// Rate limiter for registration route
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: "Too many accounts created from this IP, please try again after an hour."
});

router.post('/register', async (req, res) => {
  const { studentId, email, password } = req.body;

  try {
    const approvedStudent = await ApprovedStudentId.findOne({ where: { student_id: studentId } });

    if (!approvedStudent) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      studentId,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isAdmin = await Admin.findOne({ where: { email } });

    const token = jwt.sign({ id: user.id, isAdmin: !!isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, isAdmin: !!isAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;