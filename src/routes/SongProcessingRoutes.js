const express = require('express');
const router = express.Router();

const SongProcessingController = require('../controllers/SongProcessingController');

// Endpoint to receive information when a song finishes processing
router.post('/completed', SongProcessingController.handleProcessingComplete);

// Endpoint to receive log information about song processing
router.post('/log', SongProcessingController.handleProcessingLog);

// Endpoint to receive detailed song segments
router.post('/segments', SongProcessingController.handleSongSegments);


module.exports = router;
