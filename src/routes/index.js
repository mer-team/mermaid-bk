const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const songRoutes = require('./songRoutes');
const feedbackRoutes = require('./feedbackRoutes');
const classificationRoutes = require('./classificationRoutes');
const { sendMessage } = require('../services/rabbitmqService');

// Mount all route files
router.use('/users', userRoutes);
router.use('/songs', songRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/classifications', classificationRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: |
 *       Returns a simple status object to indicate that the API is running and reachable.
 *       Useful for uptime monitoring and automated health checks.
 *     tags: [System]
 *     operationId: healthCheck
 *     responses:
 *       200:
 *         description: API is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *             example:
 *               status: ok
 */
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * @swagger
 * /queue/send:
 *   get:
 *     summary: Send a test message to the RabbitMQ video download queue
 *     description: |
 *       Sends a sample message to the `videoDownloadQueue` in RabbitMQ.
 *       This is typically used to verify RabbitMQ integration and message delivery.
 *     tags: [System]
 *     operationId: sendRabbitMQTestMessage
 *     responses:
 *       200:
 *         description: Message sent to RabbitMQ successfully
 *         content:
 *           text/plain:
 *             example: Message sent to RabbitMQ
 *       500:
 *         description: Failed to send message to RabbitMQ
 *         content:
 *           text/plain:
 *             example: Failed to send message to RabbitMQ
 */
router.get('/queue/send', async (req, res) => {
  try {
    await sendMessage(
      'videoDownloadQueue',
      JSON.stringify({
        url: 'https://example.com/video',
        format: 'mp4',
      })
    );
    res.status(200).send('Message sent to RabbitMQ');
  } catch (error) {
    console.error('Error sending message to RabbitMQ:', error);
    res.status(500).send('Failed to send message to RabbitMQ');
  }
});

// Add a /up route for health checks
router.get('/up', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = router;
