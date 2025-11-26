const express = require('express');
const router = express.Router();

const userRoutes = require('./UserRoutes');
const songRoutes = require('./SongRoutes');
const songClassificationRoutes = require('./SongClassificationRoutes');
const feedbackRoutes = require('./FeedbackRoutes');
const songProcessingRoutes = require('./SongProcessingRoutes');
const youtubeRoutes = require('./YouTubeRoutes');

// Aggregate routes
router.use('/user', userRoutes);
router.use('/song', songRoutes);
router.use('/classification', songClassificationRoutes);
router.use('/processing', songProcessingRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/youtube', youtubeRoutes);

module.exports = router;
