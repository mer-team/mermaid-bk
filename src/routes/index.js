const express = require('express');

const { sendMessage } = require('../services/rabbitmqService');

const classificationRoutes = require('./classificationRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const songRoutes = require('./songRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

// Health check route
router.get('/up', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register routes
router.use('/users', userRoutes);
router.use('/songs', songRoutes);
router.use('/classifications', classificationRoutes);
router.use('/feedbacks', feedbackRoutes);

// RabbitMQ route

router.get('/queue/send', async (req, res) => {
  try {
    await sendMessage(
      'videoDownloadQueue',
      JSON.stringify({
        url: 'https://example.com/video',
        format: 'mp4',
      }),
    );
    res.status(200).send('Message sent to RabbitMQ');
  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error);
    res.status(500).send('Failed to send message to RabbitMQ');
  }
});

module.exports = router;
