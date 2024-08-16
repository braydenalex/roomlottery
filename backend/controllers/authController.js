const User = require('../models/User');
const ApprovedStudentId = require('../models/ApprovedStudentId');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    console.log('Received registration request:', req.body);

    const { studentId, email, password } = req.body;

    console.log('Checking if student ID is valid...');
    const validStudent = await ApprovedStudentId.findOne({ where: { student_id: studentId } });
    if (!validStudent) {
      console.log('Invalid student ID');
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    console.log('Checking if email is already registered...');
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Email already registered');
      return res.status(400).json({ error: 'Email is already registered' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating new user...');
    const newUser = await User.create({
      studentId,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    if (!newUser) {
      console.log('User creation failed');
      return res.status(500).json({ error: 'User creation failed' });
    }

    console.log('Generating token...');
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Registration successful, returning token');
    return res.json({ token });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
