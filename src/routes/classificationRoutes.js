const express = require('express');
const SongClassificationController = require('../controllers/SongClassificationController');

const router = express.Router();

// Get all classifications
router.get('/', SongClassificationController.index);

// Process a new song classification
router.post('/songs/:external_id/users/:user_id', SongClassificationController.classify);

module.exports = router;
