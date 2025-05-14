const express = require('express');

const SongController = require('../controllers/SongController');
const {
  validateToken,
  songValidationRules,
  validate,
} = require('../middleware');

const router = express.Router();

// Public song endpoints
router.get('/', SongController.index);
router.get('/:id', SongController.show);

// Song filtering routes with validation
router.get(
  '/filter/name/:title',
  songValidationRules.filter,
  validate,
  SongController.filterByName,
);

router.get(
  '/filter/emotion/:emotion',
  songValidationRules.filter,
  validate,
  SongController.filterByEmotion,
);

router.get(
  '/filter/name/:title/emotion/:emotion',
  songValidationRules.filter,
  validate,
  SongController.filterByAll,
);

// Song statistics and user-specific song routes
router.post('/:song_id/hits', SongController.updateHits);
router.get('/:song_id/hits', SongController.getHits);

// Protected routes
router.get('/user/:user_id/queue', validateToken, SongController.getQueueSongs);
router.get('/ip/queue', SongController.getQueueSongsByIp);
router.delete('/:id', validateToken, SongController.deleteSong);

// Analytics routes - protected for admin access
router.get(
  '/stats/streamed-minutes',
  validateToken,
  SongController.getStreamedMinutes,
);
router.get(
  '/stats/analyzed-videos',
  validateToken,
  SongController.AnalysedVideos,
);
router.get(
  '/stats/latest-classifications',
  validateToken,
  SongController.getLatestClassifications,
);

module.exports = router;
