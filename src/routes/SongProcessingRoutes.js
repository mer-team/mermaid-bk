const express = require('express');
const router = express.Router();

// Controller
const SongProcessingController = require('../controllers/SongProcessingController');

// Song Processing Routes
router.post('/completed', SongProcessingController.handleProcessingComplete);
router.post('/log', SongProcessingController.handleProcessingLog);
router.post('/segments', SongProcessingController.handleSongSegments);

module.exports = router;
