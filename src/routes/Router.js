const express = require('express');
const router = express.Router();

const userRoutes = require('./UserRoutes');
const songRoutes = require('./SongRoutes');
const songClassificationRoutes = require('./SongClassificationRoutes');
const feedbackRoutes = require('./FeedbackRoutes');
const songProcessingRoutes = require("./SongProcessingRoutes");
const { sendMessage } = require('../Services/rabbitmqService');

// Aggregate routes
router.use('/user', userRoutes);
router.use('/song', songRoutes);
router.use('/classification', songClassificationRoutes);
router.use('/processing', songProcessingRoutes);
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
