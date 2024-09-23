const express = require('express');
const router = express.Router();

// Controller
const SongClassificationController = require('../controllers/SongClassificationController');

// Song Classification routes
router.get('/', SongClassificationController.index);
router.post('/:external_id/user/:user_id', SongClassificationController.classify);

module.exports = router;
