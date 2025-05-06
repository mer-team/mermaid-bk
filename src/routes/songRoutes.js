const express = require('express');
const SongController = require('../controllers/SongController');

const router = express.Router();

// Get all songs with optional filtering
router.get('/', SongController.index);
router.get('/:id', SongController.show);

// Song filtering routes
router.get('/filter/name/:title', SongController.filterByName);
router.get('/filter/emotion/:emotion', SongController.filterByEmotion);
router.get('/filter/name/:title/emotion/:emotion', SongController.filterByAll);

// Song statistics and user-specific song routes
router.post('/:song_id/hits', SongController.updateHits);
router.get('/:song_id/hits', SongController.getHits);
router.get('/user/:user_id/queue', SongController.getQueueSongs);
router.get('/ip/queue', SongController.getQueueSongsByIp);
router.delete('/:id', SongController.deleteSong);

// Analytics routes
router.get('/stats/streamed-minutes', SongController.getStreamedMinutes);
router.get('/stats/analyzed-videos', SongController.AnalysedVideos);
router.get('/stats/latest-classifications', SongController.getLatestClassifications);

module.exports = router;
