const express = require('express');
const router = express.Router();

// Controller
const SongClassificationController = require('../controllers/SongClassificationController');

// Song Classification routes
router.get('/', SongClassificationController.index);
router.get('/segments/:song_id', SongClassificationController.getSegments);
router.post('/:external_id/user/:user_id', SongClassificationController.classify);

module.exports = router;
