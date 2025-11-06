const express = require('express');
const router = express.Router();

// Controller
const SongProcessingController = require('../controllers/SongProcessingController');

// Song Processing Routes
router.post('/completed', SongProcessingController.handleProcessingComplete);
router.post('/log', SongProcessingController.handleProcessingLog);
router.post('/segments', SongProcessingController.handleSongSegments);
router.post('/stage-update', SongProcessingController.handleStageUpdate);
router.post('/error', SongProcessingController.handlePipelineError);

module.exports = router;
