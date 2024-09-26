const express = require('express');
const router = express.Router();

// Controller
const SongController = require('../controllers/SongController');

// Song routes
router.get('/', SongController.index);
router.get('/:external_id', SongController.show);
router.get('/name/:title', SongController.filterByTitleAndArtist);
router.get('/emotion/:emotion', SongController.filterByEmotion);
router.get('/name/:title/emotion/:emotion', SongController.filterByAll);
router.get('/getqueuesongs/:user_id', SongController.getQueueSongs);
router.get('/getqueuesongsbyip/:user_ip', SongController.getQueueSongsByIp);
router.post('/hits/:song_id', SongController.updateHits);
router.get('/hits/:song_id', SongController.getHits);
router.delete('/delete/:id', SongController.deleteSong);
router.get('/get/streamedminutes', SongController.getStreamedMinutes);
router.get('/get/analysed/videos', SongController.analysedVideos);
router.get('/get/latest/classifications', SongController.getLatestClassifications);

module.exports = router;
