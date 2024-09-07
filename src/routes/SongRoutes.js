const express = require('express');
const router = express.Router();
const SongController = require('../controllers/SongController');

// Song routes
router.get('/song', SongController.index);
router.get('/song/:id', SongController.show);
router.get('/song/name/:title', SongController.filterByName);
router.get('/song/emotion/:emotion', SongController.filterByEmotion);
router.get('/song/name/:title/emotion/:emotion', SongController.filterByAll);
router.get('/song/getqueuesongs/:user_id', SongController.getQueueSongs);
router.get('/song/getqueuesongsbyip/:user_ip', SongController.getQueueSongsByIp);
router.post('/song/hits/:song_id', SongController.updateHits);
router.get('/song/hits/:song_id', SongController.getHits);
router.delete('/song/delete/:id', SongController.deleteSong);
router.get('/song/get/streamedminutes', SongController.getStreamedMinutes);
router.get('/song/get/analysed/videos', SongController.analysedVideos);
router.get('/song/get/latest/classifications', SongController.getLatestClassifications);
router.get('/songbyip', SongController.getQueueSongsByIp);

module.exports = router;
