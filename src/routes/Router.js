const express = require('express');
const router = express.Router();

const userRoutes = require('./UserRoutes');
const songRoutes = require('./SongRoutes');
const songClassificationRoutes = require('./SongClassificationRoutes');
const feedbackRoutes = require('./FeedbackRoutes');
const { sendMessage } = require('../Services/rabbitmqService');

// Aggregate routes
router.use('/users', userRoutes);
router.use('/songs', songRoutes);
router.use('/classifications', songClassificationRoutes);
router.use('/feedback', feedbackRoutes);

// RabbitMQ route
router.get('/sendQueueMessage', async (req, res) => {
  try {
    await sendMessage('videoDownloadQueue', 'Test message from /send route');
    res.status(200).send('Message sent to RabbitMQ');
  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error);
    res.status(500).send('Failed to send message to RabbitMQ');
  }
});

module.exports = router;
