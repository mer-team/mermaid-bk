const express = require('express');
const router = express.Router();

// Controller
const SongClassificationController = require('../controllers/SongClassificationController');

// Song Classification routes
router.get('/', SongClassificationController.index);
router.get('/status/:external_id', SongClassificationController.checkStatus);
router.get('/segments/:song_id', SongClassificationController.getSegments);
router.get('/stems/:song_id', SongClassificationController.getStems);
router.get('/fullLyrics/:song_id', SongClassificationController.getFullLyrics);
router.get('/vocalLyrics/:song_id', SongClassificationController.getVocalLyrics);
router.post('/:external_id/user/:user_id', SongClassificationController.classify);
router.get('/getVoice/:song_id', SongClassificationController.getVoice);
router.get('/getLyrics/:song_id', SongClassificationController.getLyrics);
router.get('/getInstrumental/:song_id', SongClassificationController.getInstrumental);
router.get('/getLogs/:song_id', SongClassificationController.getLogs);

module.exports = router;
