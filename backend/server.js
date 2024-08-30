require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rate Limiter: Apply to all requests
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
});

// Routes 
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

sequelize.sync({ force: false }).then(() => {
  console.log('Database synced');
}).catch(error => {
  console.error('Failed to sync database:', error);
});

app.listen(5000, () => console.log('Server started on port 5000'));
