const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const PORT = 9365;

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const workoutRoutes = require('./routes/workoutRoutes');
const weightRoutes = require('./routes/weightRoutes');
const userRoutes = require('./routes/userRoutes');
const goalRoutes = require('./routes/goalRoutes');

const server = express();

server.use(morgan('tiny'));
server.use(cors());
server.use(express.json());

server.use('/api', authRoutes);
server.use('/api', profileRoutes);
server.use('/api', workoutRoutes);
server.use('/api', weightRoutes);
server.use('/api', userRoutes);
server.use('/api', goalRoutes);

server.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
