const express = require('express');
const userRoutes = require('./userRoutes');
const songRoutes = require('./songRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const classificationRoutes = require('./classificationRoutes');

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
const { sendMessage } = require('../Services/rabbitmqService');
router.get('/queue/send', async (req, res) => {
    try {
        await sendMessage('videoDownloadQueue', 'Test message from /send route');
        res.status(200).send('Message sent to RabbitMQ');
    } catch (error) {
        console.error('Error sending message to RabbitMQ:', error);
        res.status(500).send('Failed to send message to RabbitMQ');
    }
});

module.exports = router;
