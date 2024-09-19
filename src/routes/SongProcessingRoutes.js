const express = require('express');
const router = express.Router();
const SongProcessingController = require('../controllers/SongProcessingController');

// Endpoint to receive information when a song finishes processing
router.post('/processing/completed', SongProcessingController.handleProcessingComplete);

// Endpoint to receive log information about song processing
router.post('/processing/log', SongProcessingController.handleProcessingLog);

// Endpoint to receive detailed song segments
router.post('/processing/segments', SongProcessingController.handleSongSegments);


module.exports = router;
